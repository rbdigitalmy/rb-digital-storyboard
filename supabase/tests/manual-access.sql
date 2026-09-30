begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','2b999695-e255-4e35-b98f-b9cb7536393d',true);
insert into public.access_requests(user_id) values(auth.uid()) on conflict do nothing;
select public.review_access_request(auth.uid(),true);
do $$ begin
  if not exists(select 1 from public.entitlements where user_id=auth.uid() and product_id='gpt-storyboard' and status='active') then raise exception 'Approval failed'; end if;
end $$;
select public.review_access_request(auth.uid(),false);
do $$ begin
  if exists(select 1 from public.entitlements where user_id=auth.uid() and product_id='gpt-storyboard' and status='active') then raise exception 'Revocation failed'; end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ begin
  begin
    perform public.review_access_request('2b999695-e255-4e35-b98f-b9cb7536393d',true);
    raise exception 'Non-admin unexpectedly approved access';
  exception when raise_exception then
    if sqlerrm <> 'Admin required' then raise; end if;
  end;
end $$;
rollback;
