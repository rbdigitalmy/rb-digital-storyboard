-- =============================================================================
-- RB DIGITAL PLUGIN ACCESS SYSTEM — INITIAL SCHEMAS, TABLES & POLICIES
-- Migration: 20260930000000_initial_schema.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY, -- e.g. 'gpt-storyboard'
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. PLANS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY, -- e.g. 'gpt-storyboard-lifetime', 'gpt-storyboard-pro'
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('one_time', 'lifetime', 'recurring', 'credit_pack')),
  duration_days INTEGER DEFAULT NULL, -- NULL indicates lifetime or credit-based
  credits_included INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'MYR',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. PURCHASES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'bcl',
  provider_order_id TEXT NOT NULL,
  provider_customer_id TEXT,
  product_id TEXT NOT NULL REFERENCES public.products(id),
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MYR',
  verified_payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (verified_payment_status IN ('pending', 'verified', 'failed', 'refunded', 'cancelled')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT purchases_provider_order_key UNIQUE (provider, provider_order_id)
);

-- -----------------------------------------------------------------------------
-- 5. ENTITLEMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id),
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'pending', 'revoked')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NULL,
  source_purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  granted_by TEXT NOT NULL DEFAULT 'bcl_webhook',
  revoked_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT entitlements_user_product_key UNIQUE (user_id, product_id)
);

-- -----------------------------------------------------------------------------
-- 6. SUBSCRIPTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id),
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. CREDIT WALLETS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. CREDIT TRANSACTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.credit_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('grant', 'spend', 'refund', 'adjustment')),
  reference_id TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. WEBHOOK EVENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'bcl',
  idempotency_key TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed', 'ignored')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. MCP USAGE LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mcp_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'denied', 'error')),
  credits_charged INTEGER NOT NULL DEFAULT 0,
  input_summary JSONB DEFAULT '{}'::jsonb,
  error_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. ADMIN AUDIT LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 12. CUSTOMER CLAIMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  purchase_email TEXT NOT NULL,
  order_id TEXT NOT NULL,
  claim_status TEXT NOT NULL DEFAULT 'pending' CHECK (claim_status IN ('pending', 'verified', 'rejected')),
  verification_code TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 13. OAUTH CODES TABLE (FOR PKCE AUTHORIZATION FLOW)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.oauth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  code_challenge_method TEXT NOT NULL DEFAULT 'S256',
  scope TEXT NOT NULL DEFAULT 'mcp:read mcp:execute',
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE & FAST LOOKUPS
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_provider_order ON public.purchases(provider, provider_order_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_product ON public.entitlements(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_status ON public.entitlements(status);
CREATE INDEX IF NOT EXISTS idx_credit_wallets_user_id ON public.credit_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_key ON public.webhook_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_mcp_usage_logs_user_id ON public.mcp_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_codes_code ON public.oauth_codes(code);

-- =============================================================================
-- SECURITY DEFINER HELPER FUNCTIONS & TRIGGERS
-- =============================================================================

-- Check if user is an admin securely
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND role = 'admin'
  );
END;
$$;

-- Trigger to create profile and credit wallet automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  INSERT INTO public.credit_wallets (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 100, 100, 0) -- Free signup bonus credits
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- ATOMIC FUNCTION: GRANT ENTITLEMENT & ADD CREDITS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.grant_entitlement_atomic(
  p_user_id UUID,
  p_product_id TEXT,
  p_plan_id TEXT,
  p_source_purchase_id UUID DEFAULT NULL,
  p_granted_by TEXT DEFAULT 'bcl_webhook'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan RECORD;
  v_expires_at TIMESTAMPTZ := NULL;
  v_entitlement_id UUID;
  v_credits_to_add INT := 0;
BEGIN
  -- Fetch plan rules
  SELECT * INTO v_plan FROM public.plans WHERE id = p_plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan with ID % not found', p_plan_id;
  END IF;

  -- Calculate expiration if duration_days is specified
  IF v_plan.duration_days IS NOT NULL AND v_plan.duration_days > 0 THEN
    v_expires_at := NOW() + (v_plan.duration_days || ' days')::INTERVAL;
  END IF;

  -- Upsert entitlement atomically
  INSERT INTO public.entitlements (
    user_id, product_id, plan_id, status, starts_at, expires_at, source_purchase_id, granted_by
  )
  VALUES (
    p_user_id, p_product_id, p_plan_id, 'active', NOW(), v_expires_at, p_source_purchase_id, p_granted_by
  )
  ON CONFLICT (user_id, product_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    status = 'active',
    starts_at = NOW(),
    expires_at = EXCLUDED.expires_at,
    source_purchase_id = EXCLUDED.source_purchase_id,
    granted_by = EXCLUDED.granted_by,
    revoked_at = NULL
  RETURNING id INTO v_entitlement_id;

  -- Add plan credits to wallet if plan includes credits
  v_credits_to_add := COALESCE(v_plan.credits_included, 0);
  IF v_credits_to_add > 0 THEN
    INSERT INTO public.credit_wallets (user_id, balance, total_earned, total_spent)
    VALUES (p_user_id, v_credits_to_add, v_credits_to_add, 0)
    ON CONFLICT (user_id) DO UPDATE SET
      balance = credit_wallets.balance + v_credits_to_add,
      total_earned = credit_wallets.total_earned + v_credits_to_add,
      updated_at = NOW();

    -- Record credit grant transaction
    INSERT INTO public.credit_transactions (
      wallet_id, user_id, amount, type, reference_id, description
    )
    SELECT id, p_user_id, v_credits_to_add, 'grant', p_source_purchase_id::text, 'Credits granted from purchase of ' || v_plan.name
    FROM public.credit_wallets WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'entitlement_id', v_entitlement_id,
    'user_id', p_user_id,
    'product_id', p_product_id,
    'plan_id', p_plan_id,
    'credits_added', v_credits_to_add,
    'expires_at', v_expires_at
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- ATOMIC FUNCTION: DEDUCT CREDITS (ATOMIC ROW LOCK)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deduct_credits_atomic(
  p_user_id UUID,
  p_amount INT,
  p_tool_name TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet RECORD;
  v_new_balance INT;
BEGIN
  -- Lock wallet row FOR UPDATE to prevent race conditions
  SELECT * INTO v_wallet
  FROM public.credit_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credit wallet not found for user %', p_user_id;
  END IF;

  IF v_wallet.balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_CREDITS',
      'current_balance', v_wallet.balance,
      'required', p_amount
    );
  END IF;

  v_new_balance := v_wallet.balance - p_amount;

  UPDATE public.credit_wallets
  SET balance = v_new_balance,
      total_spent = total_spent + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (
    wallet_id, user_id, amount, type, reference_id, description
  )
  VALUES (
    v_wallet.id, p_user_id, p_amount, 'spend', p_reference_id, 'Used tool: ' || p_tool_name
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'spent', p_amount
  );
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES ON ALL TABLES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users read/update own profile; Admins full access
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update own non-role profile fields" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = role);

CREATE POLICY "Admins full access profiles" ON public.profiles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Products & Plans: Public read active products & plans
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (active = TRUE OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT USING (active = TRUE OR public.is_admin(auth.uid()));

-- Purchases: Users view own purchases only; Admins view all
CREATE POLICY "Users view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Entitlements: Users view own entitlements only; Admins view all
CREATE POLICY "Users view own entitlements" ON public.entitlements
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Subscriptions: Users view own subscriptions
CREATE POLICY "Users view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Credit Wallets & Transactions: Users view own wallet and transactions
CREATE POLICY "Users view own wallet" ON public.credit_wallets
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- MCP Usage Logs: Users view own usage logs
CREATE POLICY "Users view own mcp logs" ON public.mcp_usage_logs
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Customer Claims: Users view and insert own claims
CREATE POLICY "Users view own claims" ON public.customer_claims
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users create claims" ON public.customer_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Webhook Events & Admin Logs: Admin access only
CREATE POLICY "Admins view webhook events" ON public.webhook_events
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

-- OAuth Codes: User code verification
CREATE POLICY "Users access own oauth codes" ON public.oauth_codes
  FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- =============================================================================
-- SEED INITIAL DATA: PRODUCTS & PLANS
-- =============================================================================
INSERT INTO public.products (id, slug, name, description, active)
VALUES (
  'gpt-storyboard',
  'gpt-storyboard',
  'RB Digital Storyboard Suite',
  '19 viral short-form video storyboard workflows, video prompt generators, and visual content suite for ChatGPT.',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.plans (id, product_id, name, type, duration_days, credits_included, price, currency, active)
VALUES
  (
    'gpt-storyboard-lifetime',
    'gpt-storyboard',
    'Lifetime Access Pass',
    'lifetime',
    NULL,
    5000,
    199.00,
    'MYR',
    TRUE
  ),
  (
    'gpt-storyboard-annual',
    'gpt-storyboard',
    'Annual Access Pass',
    'recurring',
    365,
    2000,
    99.00,
    'MYR',
    TRUE
  ),
  (
    'gpt-storyboard-starter',
    'gpt-storyboard',
    'Starter Pass',
    'one_time',
    30,
    500,
    49.00,
    'MYR',
    TRUE
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits_included = EXCLUDED.credits_included,
  price = EXCLUDED.price;
