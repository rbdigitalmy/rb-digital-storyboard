-- Pin the lookup namespace for privileged routines so objects cannot be
-- shadowed through a caller-controlled search_path.
alter function public.is_admin(uuid)
  set search_path = public, pg_temp;

alter function public.grant_entitlement_atomic(uuid, text, text, uuid, text)
  set search_path = public, pg_temp;

alter function public.deduct_credits_atomic(uuid, integer, text, text)
  set search_path = public, pg_temp;

-- The legacy deduction routine trusts p_user_id and must never be exposed via
-- PostgREST. The MCP Edge Function uses consume_storyboard_credits(), which checks auth.uid(),
-- validates entitlement, locks the wallet, and is request-id idempotent.
revoke all on function public.deduct_credits_atomic(uuid, integer, text, text)
  from public, anon, authenticated;
grant execute on function public.deduct_credits_atomic(uuid, integer, text, text)
  to service_role;

-- is_admin() is needed by authenticated RLS policies, but anonymous callers
-- must not be able to probe administrator UUIDs.
revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;
