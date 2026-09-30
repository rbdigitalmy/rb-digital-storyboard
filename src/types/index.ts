export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
}

export type PlanType = 'one_time' | 'lifetime' | 'recurring' | 'credit_pack';

export interface Plan {
  id: string;
  product_id: string;
  name: string;
  type: PlanType;
  duration_days: number | null;
  credits_included: number;
  price: number;
  currency: string;
  active: boolean;
  created_at: string;
}

export type VerifiedPaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded' | 'cancelled';

export interface Purchase {
  id: string;
  user_id: string;
  provider: string;
  provider_order_id: string;
  provider_customer_id: string | null;
  product_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  verified_payment_status: VerifiedPaymentStatus;
  purchased_at: string;
  verified_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  products?: { name: string };
  plans?: { name: string };
}

export type EntitlementStatus = 'active' | 'expired' | 'suspended' | 'pending' | 'revoked';

export interface Entitlement {
  id: string;
  user_id: string;
  product_id: string;
  plan_id: string;
  status: EntitlementStatus;
  starts_at: string;
  expires_at: string | null;
  source_purchase_id: string | null;
  granted_by: string;
  revoked_at: string | null;
  created_at: string;
  products?: { name: string; description: string };
  plans?: { name: string; type: PlanType };
}

export interface CreditWallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  type: 'grant' | 'spend' | 'refund' | 'adjustment';
  reference_id: string | null;
  description: string;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  idempotency_key: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: 'received' | 'processed' | 'failed' | 'ignored';
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface McpUsageLog {
  id: string;
  user_id: string;
  tool_name: string;
  status: 'success' | 'denied' | 'error';
  credits_charged: number;
  input_summary: Record<string, unknown>;
  error_details: string | null;
  created_at: string;
  profiles?: { email: string; full_name: string };
}

export interface CustomerClaim {
  id: string;
  user_id: string;
  purchase_email: string;
  order_id: string;
  claim_status: 'pending' | 'verified' | 'rejected';
  verification_code: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface StoryboardScene {
  scene_number: number;
  timeframe: string;
  visual: string;
  camera: string;
  action: string;
  emotion: string;
  dialogue: string;
  ai_image_prompt: string;
  ai_video_prompt?: string;
}

export interface StoryboardResult {
  id: string;
  workflow_id: string;
  topic: string;
  style: string;
  duration: string;
  target_audience: string;
  language: string;
  product_name: string;
  aspect_ratio: string;
  scenes: StoryboardScene[];
  created_at: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: 'storyboard' | 'visual_assets' | 'specialized';
  icon: string;
  tag: string;
  badgeColor: string;
  recommendedDuration: string;
  samplePrompt: string;
}
