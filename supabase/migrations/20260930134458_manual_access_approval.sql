begin;
create table public.access_requests (
  user_id uuid primary key references public.profiles(id),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);
alter table public.access_requests enable row level security;
revoke all on public.access_requests from anon, authenticated;
grant select, insert, update on public.access_requests to authenticated;
create policy "Read own request or admin" on public.access_requests for select to authenticated
using (user_id=(select auth.uid()) or public.is_admin((select auth.uid())));
create policy "Request own pending access" on public.access_requests for insert to authenticated
with check (user_id=(select auth.uid()) and status='pending' and reviewed_at is null and reviewed_by is null);
create policy "Only admins review requests" on public.access_requests for update to authenticated
using (public.is_admin((select auth.uid()))) with check (public.is_admin((select auth.uid())));
grant insert, update on public.entitlements to authenticated;
create policy "Admin grants access" on public.entitlements for insert to authenticated
with check (public.is_admin((select auth.uid())));
create policy "Admin updates access" on public.entitlements for update to authenticated
using (public.is_admin((select auth.uid()))) with check (public.is_admin((select auth.uid())));
create function public.review_access_request(p_user_id uuid, p_approved boolean)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if auth.uid() is null or not public.is_admin(auth.uid()) then raise exception 'Admin required'; end if;
  perform 1 from public.access_requests where user_id=p_user_id for update;
  if not found then raise exception 'Request not found'; end if;
  if p_approved then
    insert into public.entitlements(user_id,product_id,plan_id,status,granted_by)
    values(p_user_id,'gpt-storyboard','gpt-storyboard-lifetime','active','manual_admin')
    on conflict(user_id,product_id) do update set status='active',expires_at=null,revoked_at=null,granted_by='manual_admin';
  else
    update public.entitlements set status='revoked',revoked_at=now() where user_id=p_user_id and product_id='gpt-storyboard';
  end if;
  update public.access_requests set status=case when p_approved then 'approved' else 'rejected' end,
    reviewed_at=now(),reviewed_by=auth.uid() where user_id=p_user_id;
end; $$;
revoke all on function public.review_access_request(uuid,boolean) from public,anon;
grant execute on function public.review_access_request(uuid,boolean) to authenticated;
commit;
