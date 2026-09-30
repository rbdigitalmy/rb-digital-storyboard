-- RB Digital Storyboard: production security hardening
-- This migration removes client-controlled authorization, scopes privileged
-- functions, adds per-user plugin settings, and makes MCP credit charging
-- idempotent and atomic.

create schema if not exists private;

-- A customer must never be able to promote themselves via user metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  insert into public.credit_wallets (user_id, balance, total_earned, total_spent)
  values (new.id, 100, 100, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Only the backend service may grant entitlements.
revoke all on function public.grant_entitlement_atomic(uuid, text, text, uuid, text)
  from public, anon, authenticated;
grant execute on function public.grant_entitlement_atomic(uuid, text, text, uuid, text)
  to service_role;

-- Users may change their display name, but never email or role through Data API.
drop policy if exists "Users can update own non-role profile fields" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Legacy custom OAuth codes are no longer part of the public API. Supabase Auth
-- is the OAuth 2.1 authorization server and owns code/refresh-token lifecycle.
revoke all on public.oauth_codes from anon, authenticated;
drop policy if exists "Users access own oauth codes" on public.oauth_codes;

create table if not exists public.storyboard_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language text not null default 'Malay' check (language in ('Malay', 'English')),
  aspect_ratio text not null default '9:16' check (aspect_ratio in ('9:16', '16:9', '1:1')),
  default_style text not null default 'storyboard-universal',
  default_duration text not null default '10s' check (default_duration in ('10s', '20s', '30s', '60s')),
  updated_at timestamptz not null default now()
);

alter table public.storyboard_preferences enable row level security;

create policy "Users read own storyboard preferences"
  on public.storyboard_preferences for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users create own storyboard preferences"
  on public.storyboard_preferences for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own storyboard preferences"
  on public.storyboard_preferences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.storyboard_preferences to authenticated;

alter table public.mcp_usage_logs
  add column if not exists request_id text;

alter table public.customer_claims
  add column if not exists verified_amount numeric(10,2),
  add column if not exists verification_code_hash text,
  add column if not exists verification_expires_at timestamptz,
  add column if not exists verification_attempts integer not null default 0;

create unique index if not exists mcp_usage_logs_user_request_unique
  on public.mcp_usage_logs (user_id, request_id)
  where request_id is not null;

drop policy if exists "Users insert own mcp logs" on public.mcp_usage_logs;
create policy "Users insert own mcp logs"
  on public.mcp_usage_logs for insert to authenticated
  with check ((select auth.uid()) = user_id);

grant select, insert on public.mcp_usage_logs to authenticated;

-- Charge once per request ID. Entitlement validation, row locking, wallet
-- mutation, ledger entry, and usage log all happen in the same transaction.
create or replace function public.consume_storyboard_credits(
  p_user_id uuid,
  p_amount integer,
  p_tool_name text,
  p_request_id text,
  p_input_summary jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_wallet public.credit_wallets%rowtype;
  v_existing public.mcp_usage_logs%rowtype;
  v_new_balance integer;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;

  if p_amount <= 0 or p_amount > 1000 then
    raise exception 'INVALID_CREDIT_AMOUNT';
  end if;

  select * into v_existing
  from public.mcp_usage_logs
  where user_id = p_user_id and request_id = p_request_id;

  if found then
    return jsonb_build_object(
      'success', v_existing.status = 'success',
      'idempotent_replay', true,
      'credits_charged', v_existing.credits_charged
    );
  end if;

  if not exists (
    select 1 from public.entitlements
    where user_id = p_user_id
      and product_id = 'gpt-storyboard'
      and status = 'active'
      and (expires_at is null or expires_at > now())
  ) then
    insert into public.mcp_usage_logs (
      user_id, tool_name, status, credits_charged, input_summary,
      error_details, request_id
    ) values (
      p_user_id, p_tool_name, 'denied', 0, p_input_summary,
      'NO_ACTIVE_ENTITLEMENT', p_request_id
    );
    return jsonb_build_object('success', false, 'error', 'NO_ACTIVE_ENTITLEMENT');
  end if;

  select * into v_wallet
  from public.credit_wallets
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'CREDIT_WALLET_NOT_FOUND';
  end if;

  if v_wallet.balance < p_amount then
    insert into public.mcp_usage_logs (
      user_id, tool_name, status, credits_charged, input_summary,
      error_details, request_id
    ) values (
      p_user_id, p_tool_name, 'denied', 0, p_input_summary,
      'INSUFFICIENT_CREDITS', p_request_id
    );
    return jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_CREDITS',
      'current_balance', v_wallet.balance,
      'required', p_amount
    );
  end if;

  v_new_balance := v_wallet.balance - p_amount;

  update public.credit_wallets
  set balance = v_new_balance,
      total_spent = total_spent + p_amount,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.credit_transactions (
    wallet_id, user_id, amount, type, reference_id, description
  ) values (
    v_wallet.id, p_user_id, -p_amount, 'spend', p_request_id,
    'Used tool: ' || p_tool_name
  );

  insert into public.mcp_usage_logs (
    user_id, tool_name, status, credits_charged, input_summary, request_id
  ) values (
    p_user_id, p_tool_name, 'success', p_amount, p_input_summary, p_request_id
  );

  return jsonb_build_object(
    'success', true,
    'idempotent_replay', false,
    'credits_charged', p_amount,
    'new_balance', v_new_balance
  );
end;
$$;

revoke all on function public.consume_storyboard_credits(uuid, integer, text, text, jsonb)
  from public, anon;
grant execute on function public.consume_storyboard_credits(uuid, integer, text, text, jsonb)
  to authenticated;
