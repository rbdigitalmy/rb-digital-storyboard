import { Profile, Product, Plan, Purchase, Entitlement, CreditWallet, CreditTransaction, CustomerClaim, McpUsageLog, StoryboardResult } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'gpt-storyboard',
    slug: 'gpt-storyboard',
    name: 'RB Digital Storyboard Suite',
    description: '19 viral short-form video storyboard workflows, prompt generators, and creative director AI for ChatGPT and Claude.',
    active: true,
    created_at: '2026-01-15T00:00:00Z'
  }
];

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'gpt-storyboard-lifetime',
    product_id: 'gpt-storyboard',
    name: 'Lifetime Access Pass',
    type: 'lifetime',
    duration_days: null,
    credits_included: 5000,
    price: 199.00,
    currency: 'MYR',
    active: true,
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'gpt-storyboard-annual',
    product_id: 'gpt-storyboard',
    name: 'Annual Access Pass',
    type: 'recurring',
    duration_days: 365,
    credits_included: 2000,
    price: 99.00,
    currency: 'MYR',
    active: true,
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'gpt-storyboard-starter',
    product_id: 'gpt-storyboard',
    name: 'Starter Pass',
    type: 'one_time',
    duration_days: 30,
    credits_included: 500,
    price: 49.00,
    currency: 'MYR',
    active: true,
    created_at: '2026-01-15T00:00:00Z'
  }
];

export const MOCK_USERS: Profile[] = [
  {
    id: 'usr_customer_demo',
    email: 'customer@rbdigital.com',
    full_name: 'Ahmad Faiz (Demo Customer)',
    role: 'customer',
    created_at: '2026-02-10T08:30:00Z',
    updated_at: '2026-02-10T08:30:00Z'
  },
  {
    id: 'usr_admin_demo',
    email: 'admin@rbdigital.com',
    full_name: 'Najib RB (Super Admin)',
    role: 'admin',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr_sarah_tan',
    email: 'sarah.tan@creatorstudios.my',
    full_name: 'Sarah Tan',
    role: 'customer',
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-03-01T12:00:00Z'
  }
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'pur_bcl_001',
    user_id: 'usr_customer_demo',
    provider: 'bcl',
    provider_order_id: 'BCL-2026-98412',
    provider_customer_id: 'bcl_cust_882',
    product_id: 'gpt-storyboard',
    plan_id: 'gpt-storyboard-lifetime',
    amount: 199.00,
    currency: 'MYR',
    verified_payment_status: 'verified',
    purchased_at: '2026-03-15T14:22:10Z',
    verified_at: '2026-03-15T14:22:15Z',
    metadata: { payment_method: 'FPX - Maybank2u', customer_phone: '+60123456789' },
    created_at: '2026-03-15T14:22:10Z'
  },
  {
    id: 'pur_bcl_002',
    user_id: 'usr_sarah_tan',
    provider: 'bcl',
    provider_order_id: 'BCL-2026-77319',
    provider_customer_id: 'bcl_cust_511',
    product_id: 'gpt-storyboard',
    plan_id: 'gpt-storyboard-annual',
    amount: 99.00,
    currency: 'MYR',
    verified_payment_status: 'verified',
    purchased_at: '2026-03-20T09:15:00Z',
    verified_at: '2026-03-20T09:15:04Z',
    metadata: { payment_method: 'FPX - CIMB Clicks' },
    created_at: '2026-03-20T09:15:00Z'
  },
  {
    id: 'pur_bcl_003',
    user_id: 'usr_customer_demo',
    provider: 'bcl',
    provider_order_id: 'BCL-2026-12055',
    provider_customer_id: 'bcl_cust_994',
    product_id: 'gpt-storyboard',
    plan_id: 'gpt-storyboard-starter',
    amount: 49.00,
    currency: 'MYR',
    verified_payment_status: 'verified',
    purchased_at: '2026-02-12T11:40:00Z',
    verified_at: '2026-02-12T11:40:05Z',
    metadata: { payment_method: 'Credit Card (Visa)' },
    created_at: '2026-02-12T11:40:00Z'
  }
];

export const INITIAL_ENTITLEMENTS: Entitlement[] = [
  {
    id: 'ent_001',
    user_id: 'usr_customer_demo',
    product_id: 'gpt-storyboard',
    plan_id: 'gpt-storyboard-lifetime',
    status: 'active',
    starts_at: '2026-03-15T14:22:15Z',
    expires_at: null,
    source_purchase_id: 'pur_bcl_001',
    granted_by: 'bcl_webhook',
    revoked_at: null,
    created_at: '2026-03-15T14:22:15Z'
  },
  {
    id: 'ent_002',
    user_id: 'usr_sarah_tan',
    product_id: 'gpt-storyboard',
    plan_id: 'gpt-storyboard-annual',
    status: 'active',
    starts_at: '2026-03-20T09:15:04Z',
    expires_at: '2027-03-20T09:15:04Z',
    source_purchase_id: 'pur_bcl_002',
    granted_by: 'bcl_webhook',
    revoked_at: null,
    created_at: '2026-03-20T09:15:04Z'
  }
];

export const INITIAL_WALLETS: Record<string, CreditWallet> = {
  usr_customer_demo: {
    id: 'wal_001',
    user_id: 'usr_customer_demo',
    balance: 4850,
    total_earned: 5100,
    total_spent: 250,
    updated_at: '2026-03-29T10:00:00Z',
    created_at: '2026-02-10T08:30:00Z'
  },
  usr_admin_demo: {
    id: 'wal_002',
    user_id: 'usr_admin_demo',
    balance: 999999,
    total_earned: 999999,
    total_spent: 0,
    updated_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z'
  },
  usr_sarah_tan: {
    id: 'wal_003',
    user_id: 'usr_sarah_tan',
    balance: 1920,
    total_earned: 2000,
    total_spent: 80,
    updated_at: '2026-03-28T16:20:00Z',
    created_at: '2026-03-20T09:15:04Z'
  }
};

export const INITIAL_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'tx_001',
    wallet_id: 'wal_001',
    user_id: 'usr_customer_demo',
    amount: 100,
    type: 'grant',
    reference_id: 'signup_bonus',
    description: 'Welcome Sign Up Bonus',
    created_at: '2026-02-10T08:30:00Z'
  },
  {
    id: 'tx_002',
    wallet_id: 'wal_001',
    user_id: 'usr_customer_demo',
    amount: 5000,
    type: 'grant',
    reference_id: 'pur_bcl_001',
    description: 'Lifetime Pass Activation Credit Bundle (5,000 Credits)',
    created_at: '2026-03-15T14:22:15Z'
  },
  {
    id: 'tx_003',
    wallet_id: 'wal_001',
    user_id: 'usr_customer_demo',
    amount: -10,
    type: 'spend',
    reference_id: 'sb_gen_01',
    description: 'Storyboard Generation: Universal Viral Script (10s)',
    created_at: '2026-03-28T11:15:00Z'
  },
  {
    id: 'tx_004',
    wallet_id: 'wal_001',
    user_id: 'usr_customer_demo',
    amount: -20,
    type: 'spend',
    reference_id: 'sb_gen_02',
    description: 'POV Hand Video Storyboard Generation (20s)',
    created_at: '2026-03-29T10:00:00Z'
  }
];

export const INITIAL_CLAIMS: CustomerClaim[] = [
  {
    id: 'clm_001',
    user_id: 'usr_customer_demo',
    purchase_email: 'customer@rbdigital.com',
    order_id: 'BCL-2026-98412',
    claim_status: 'verified',
    verification_code: null,
    verified_at: '2026-03-15T14:22:15Z',
    created_at: '2026-03-15T14:20:00Z'
  },
  {
    id: 'clm_002',
    user_id: 'usr_customer_demo',
    purchase_email: 'buyer.old@gmail.com',
    order_id: 'BCL-2025-44102',
    claim_status: 'pending',
    verification_code: '849102',
    verified_at: null,
    created_at: '2026-03-29T08:12:00Z'
  }
];

export const INITIAL_MCP_LOGS: McpUsageLog[] = [
  {
    id: 'log_001',
    user_id: 'usr_customer_demo',
    tool_name: 'generate_storyboard',
    status: 'success',
    credits_charged: 10,
    input_summary: { workflow: 'storyboard-universal', topic: 'Kopi Pra-Campuran', duration: '10s' },
    error_details: null,
    created_at: '2026-03-29T10:00:00Z'
  },
  {
    id: 'log_002',
    user_id: 'usr_customer_demo',
    tool_name: 'generate_storyboard',
    status: 'success',
    credits_charged: 20,
    input_summary: { workflow: 'storyboard-pov-hand', topic: 'Skincare Dropper', duration: '20s' },
    error_details: null,
    created_at: '2026-03-28T11:15:00Z'
  },
  {
    id: 'log_003',
    user_id: 'usr_sarah_tan',
    tool_name: 'generate_storyboard',
    status: 'success',
    credits_charged: 10,
    input_summary: { workflow: 'storyboard-talking-head', topic: 'Business Advice', duration: '10s' },
    error_details: null,
    created_at: '2026-03-28T16:20:00Z'
  }
];
