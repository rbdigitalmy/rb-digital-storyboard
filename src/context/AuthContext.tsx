import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Profile, Product, Plan, Purchase, Entitlement, CreditWallet,
  CreditTransaction, CustomerClaim, McpUsageLog, StoryboardResult
} from '../types';
import {
  INITIAL_PRODUCTS, INITIAL_PLANS, MOCK_USERS, INITIAL_PURCHASES,
  INITIAL_ENTITLEMENTS, INITIAL_WALLETS, INITIAL_TRANSACTIONS,
  INITIAL_CLAIMS, INITIAL_MCP_LOGS
} from '../lib/mockData';
import { supabase } from '../lib/supabase';

interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  bclWebhookUrl: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AuthContextType {
  currentUser: Profile | null;
  mode: 'sandbox' | 'live';
  config: SupabaseConfig;
  products: Product[];
  plans: Plan[];
  purchases: Purchase[];
  entitlements: Entitlement[];
  wallet: CreditWallet | null;
  transactions: CreditTransaction[];
  claims: CustomerClaim[];
  mcpLogs: McpUsageLog[];
  savedStoryboards: StoryboardResult[];
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  setMode: (mode: 'sandbox' | 'live') => void;
  updateConfig: (newConfig: Partial<SupabaseConfig>) => void;
  switchDemoUser: (role: 'customer' | 'admin') => void;
  loginWithEmail: (email: string, role?: 'customer' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  spendCredits: (amount: number, description: string) => Promise<boolean>;
  claimOrder: (orderId: string, purchaseEmail: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  verifyClaimOtp: (orderId: string, code: string) => Promise<{ success: boolean; message: string }>;
  saveStoryboard: (storyboard: StoryboardResult) => void;
  grantEntitlementAdmin: (userId: string, productId: string, planId: string, durationDays: number | null) => void;
  revokeEntitlementAdmin: (entitlementId: string) => void;
  addCreditsAdmin: (userId: string, amount: number, note: string) => void;
  simulateBclWebhook: (orderId: string, customerEmail: string, planId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  manualApproveClaimAdmin: (claimId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'rb_users',
  PURCHASES: 'rb_purchases',
  ENTITLEMENTS: 'rb_entitlements',
  WALLETS: 'rb_wallets',
  TRANSACTIONS: 'rb_transactions',
  CLAIMS: 'rb_claims',
  MCP_LOGS: 'rb_mcp_logs',
  STORYBOARDS: 'rb_storyboards',
  CURRENT_USER_ID: 'rb_current_user_id',
  CONFIG: 'rb_config',
  MODE: 'rb_mode'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<'sandbox' | 'live'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.MODE) as 'sandbox' | 'live') || 'sandbox';
  });

  const [config, setConfigState] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo',
      bclWebhookUrl: 'https://demo-project.supabase.co/functions/v1/bcl-webhook'
    };
  });

  const [users, setUsers] = useState<Profile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'usr_customer_demo';
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [entitlements, setEntitlements] = useState<Entitlement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENTITLEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ENTITLEMENTS;
  });

  const [wallets, setWallets] = useState<Record<string, CreditWallet>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WALLETS);
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [transactions, setTransactions] = useState<CreditTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [claims, setClaims] = useState<CustomerClaim[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  const [mcpLogs, setMcpLogs] = useState<McpUsageLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MCP_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_MCP_LOGS;
  });

  const [savedStoryboards, setSavedStoryboards] = useState<StoryboardResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORYBOARDS);
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENTITLEMENTS, JSON.stringify(entitlements));
  }, [entitlements]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }, [wallets]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
  }, [claims]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MCP_LOGS, JSON.stringify(mcpLogs));
  }, [mcpLogs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORYBOARDS, JSON.stringify(savedStoryboards));
  }, [savedStoryboards]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setMode = (newMode: 'sandbox' | 'live') => {
    setModeState(newMode);
    showToast(`Switched to ${newMode.toUpperCase()} mode`, 'info');
  };

  const updateConfig = (newConfig: Partial<SupabaseConfig>) => {
    setConfigState(prev => ({ ...prev, ...newConfig }));
    showToast('Configuration updated successfully', 'success');
  };

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || null;
  const userWallet = currentUser ? (wallets[currentUser.id] || {
    id: `wal_${currentUser.id}`,
    user_id: currentUser.id,
    balance: 500,
    total_earned: 500,
    total_spent: 0,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }) : null;

  const switchDemoUser = (role: 'customer' | 'admin') => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
      showToast(`Switched to ${targetUser.full_name} (${role})`, 'success');
    }
  };

  const loginWithEmail = async (email: string, role: 'customer' | 'admin' = 'customer') => {
    let existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      const newUser: Profile = {
        id: `usr_${Date.now()}`,
        email: email.toLowerCase(),
        full_name: email.split('@')[0],
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      setWallets(prev => ({
        ...prev,
        [newUser.id]: {
          id: `wal_${newUser.id}`,
          user_id: newUser.id,
          balance: 100, // free signup bonus
          total_earned: 100,
          total_spent: 0,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      }));
      setCurrentUserId(newUser.id);
      showToast(`Account created with 100 free bonus credits!`, 'success');
    } else {
      setCurrentUserId(existing.id);
      showToast(`Welcome back, ${existing.full_name}!`, 'success');
    }
  };

  const signOut = async () => {
    setCurrentUserId('usr_customer_demo');
    showToast('Signed out. Reset to Demo Customer view.', 'info');
  };

  const spendCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!currentUser) return false;
    const currentBalance = userWallet?.balance || 0;

    // Check if user has active Lifetime entitlement (unlimited storyboards or deduct from generous wallet)
    const hasLifetime = entitlements.some(
      e => e.user_id === currentUser.id && e.plan_id === 'gpt-storyboard-lifetime' && e.status === 'active'
    );

    if (currentBalance < amount && !hasLifetime) {
      showToast('Insufficient credits in wallet. Please purchase credits or upgrade plan.', 'error');
      return false;
    }

    const deductedAmount = Math.min(currentBalance, amount);
    const updatedWallet: CreditWallet = {
      ...(userWallet || {
        id: `wal_${currentUser.id}`,
        user_id: currentUser.id,
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }),
      balance: Math.max(0, currentBalance - deductedAmount),
      total_spent: (userWallet?.total_spent || 0) + deductedAmount,
      updated_at: new Date().toISOString()
    };

    setWallets(prev => ({ ...prev, [currentUser.id]: updatedWallet }));

    const newTx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      wallet_id: updatedWallet.id,
      user_id: currentUser.id,
      amount: -deductedAmount,
      type: 'spend',
      reference_id: `gen_${Date.now()}`,
      description,
      created_at: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);

    // Record MCP log
    const newLog: McpUsageLog = {
      id: `log_${Date.now()}`,
      user_id: currentUser.id,
      tool_name: 'generate_storyboard',
      status: 'success',
      credits_charged: deductedAmount,
      input_summary: { description },
      error_details: null,
      created_at: new Date().toISOString()
    };
    setMcpLogs(prev => [newLog, ...prev]);

    return true;
  };

  const claimOrder = async (orderId: string, purchaseEmail: string) => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in first' };
    }

    const cleanEmail = purchaseEmail.toLowerCase().trim();
    const userEmail = currentUser.email.toLowerCase().trim();

    // Check if purchase exists in local DB or BCL simulation
    const existingPurchase = purchases.find(
      p => p.provider_order_id.toLowerCase() === orderId.toLowerCase()
    );

    // If purchase not found in local DB, create a verified BCL order on the fly (BCL Malaysia mock)
    const matchedPurchase = existingPurchase || {
      id: `pur_${Date.now()}`,
      user_id: currentUser.id,
      provider: 'bcl',
      provider_order_id: orderId.toUpperCase(),
      provider_customer_id: `bcl_${Date.now()}`,
      product_id: 'gpt-storyboard',
      plan_id: 'gpt-storyboard-lifetime',
      amount: 199.00,
      currency: 'MYR',
      verified_payment_status: 'verified' as const,
      purchased_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      metadata: { source: 'historical_bcl_claim' },
      created_at: new Date().toISOString()
    };

    if (!existingPurchase) {
      setPurchases(prev => [matchedPurchase, ...prev]);
    }

    // Direct match: email matches logged-in user email
    if (cleanEmail === userEmail) {
      // Grant entitlement immediately
      grantEntitlementAtomic(currentUser.id, matchedPurchase.product_id, matchedPurchase.plan_id, matchedPurchase.id, 'bcl_claim_direct');
      
      const newClaim: CustomerClaim = {
        id: `clm_${Date.now()}`,
        user_id: currentUser.id,
        purchase_email: cleanEmail,
        order_id: orderId.toUpperCase(),
        claim_status: 'verified',
        verification_code: null,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      setClaims(prev => [newClaim, ...prev]);

      showToast(`Order ${orderId.toUpperCase()} verified! Access & credits granted instantly.`, 'success');
      return { success: true, message: 'Entitlement activated successfully!' };
    } else {
      // Email differs: Trigger OTP simulation step
      const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const pendingClaim: CustomerClaim = {
        id: `clm_${Date.now()}`,
        user_id: currentUser.id,
        purchase_email: cleanEmail,
        order_id: orderId.toUpperCase(),
        claim_status: 'pending',
        verification_code: simulatedOtp,
        verified_at: null,
        created_at: new Date().toISOString()
      };
      setClaims(prev => [pendingClaim, ...prev]);

      showToast(`Verification code sent to ${cleanEmail}. (Sandbox OTP: ${simulatedOtp})`, 'warning');
      return {
        success: true,
        requiresVerification: true,
        message: `A 6-digit verification code has been sent to ${cleanEmail}.`
      };
    }
  };

  const verifyClaimOtp = async (orderId: string, code: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in first' };

    const claim = claims.find(
      c => c.order_id.toUpperCase() === orderId.toUpperCase() && c.user_id === currentUser.id && c.claim_status === 'pending'
    );

    if (!claim) {
      return { success: false, message: 'No pending claim found for this order ID' };
    }

    if (claim.verification_code !== code && code !== '123456') {
      return { success: false, message: 'Invalid verification code. Please check your email.' };
    }

    // Update claim status
    setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, claim_status: 'verified', verified_at: new Date().toISOString() } : c));

    // Grant entitlement
    grantEntitlementAtomic(currentUser.id, 'gpt-storyboard', 'gpt-storyboard-lifetime', null, 'bcl_claim_otp_verified');

    showToast(`Order ${orderId} successfully verified! Lifetime access unlocked.`, 'success');
    return { success: true, message: 'Order verified! Lifetime pass is now active.' };
  };

  const grantEntitlementAtomic = (
    userId: string,
    productId: string,
    planId: string,
    purchaseId: string | null,
    grantedBy: string
  ) => {
    const plan = INITIAL_PLANS.find(p => p.id === planId) || INITIAL_PLANS[0];
    let expiresAt: string | null = null;
    if (plan.duration_days) {
      const exp = new Date();
      exp.setDate(exp.getDate() + plan.duration_days);
      expiresAt = exp.toISOString();
    }

    setEntitlements(prev => {
      const filtered = prev.filter(e => !(e.user_id === userId && e.product_id === productId));
      const newEntitlement: Entitlement = {
        id: `ent_${Date.now()}`,
        user_id: userId,
        product_id: productId,
        plan_id: planId,
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: expiresAt,
        source_purchase_id: purchaseId,
        granted_by: grantedBy,
        revoked_at: null,
        created_at: new Date().toISOString()
      };
      return [newEntitlement, ...filtered];
    });

    // Add credits to wallet
    const creditsToAdd = plan.credits_included || 0;
    if (creditsToAdd > 0) {
      setWallets(prev => {
        const curWallet = prev[userId] || {
          id: `wal_${userId}`,
          user_id: userId,
          balance: 0,
          total_earned: 0,
          total_spent: 0,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        return {
          ...prev,
          [userId]: {
            ...curWallet,
            balance: curWallet.balance + creditsToAdd,
            total_earned: curWallet.total_earned + creditsToAdd,
            updated_at: new Date().toISOString()
          }
        };
      });

      const newTx: CreditTransaction = {
        id: `tx_${Date.now()}`,
        wallet_id: `wal_${userId}`,
        user_id: userId,
        amount: creditsToAdd,
        type: 'grant',
        reference_id: purchaseId || 'admin_grant',
        description: `${plan.name} Credit Bundle (+${creditsToAdd} Credits)`,
        created_at: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  const saveStoryboard = (storyboard: StoryboardResult) => {
    setSavedStoryboards(prev => [storyboard, ...prev]);
    showToast('Storyboard saved to your history!', 'success');
  };

  const grantEntitlementAdmin = (userId: string, productId: string, planId: string, durationDays: number | null) => {
    grantEntitlementAtomic(userId, productId, planId, null, 'admin_manual_grant');
    showToast('Admin: Entitlement successfully granted', 'success');
  };

  const revokeEntitlementAdmin = (entitlementId: string) => {
    setEntitlements(prev => prev.map(e => e.id === entitlementId ? { ...e, status: 'revoked', revoked_at: new Date().toISOString() } : e));
    showToast('Admin: Entitlement revoked', 'warning');
  };

  const addCreditsAdmin = (userId: string, amount: number, note: string) => {
    setWallets(prev => {
      const curWallet = prev[userId] || {
        id: `wal_${userId}`,
        user_id: userId,
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      return {
        ...prev,
        [userId]: {
          ...curWallet,
          balance: curWallet.balance + amount,
          total_earned: curWallet.total_earned + Math.max(0, amount),
          updated_at: new Date().toISOString()
        }
      };
    });

    const newTx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      wallet_id: `wal_${userId}`,
      user_id: userId,
      amount,
      type: amount > 0 ? 'grant' : 'adjustment',
      reference_id: 'admin_adjustment',
      description: `Admin Adjustment: ${note} (${amount > 0 ? '+' : ''}${amount} Credits)`,
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(`Admin: Adjusted wallet by ${amount > 0 ? '+' : ''}${amount} credits`, 'success');
  };

  const simulateBclWebhook = async (orderId: string, customerEmail: string, planId: string, amount: number) => {
    // Find or create customer
    let customer = users.find(u => u.email.toLowerCase() === customerEmail.toLowerCase());
    if (!customer) {
      customer = {
        id: `usr_${Date.now()}`,
        email: customerEmail.toLowerCase(),
        full_name: customerEmail.split('@')[0],
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUsers(prev => [...prev, customer!]);
    }

    const newPurchase: Purchase = {
      id: `pur_${Date.now()}`,
      user_id: customer.id,
      provider: 'bcl',
      provider_order_id: orderId,
      provider_customer_id: `bcl_${Date.now()}`,
      product_id: 'gpt-storyboard',
      plan_id: planId,
      amount: amount,
      currency: 'MYR',
      verified_payment_status: 'verified',
      purchased_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      metadata: { webhook_simulated: true, gateway: 'BCL Malaysia' },
      created_at: new Date().toISOString()
    };

    setPurchases(prev => [newPurchase, ...prev]);
    grantEntitlementAtomic(customer.id, 'gpt-storyboard', planId, newPurchase.id, 'bcl_webhook');

    showToast(`BCL Webhook processed: Order ${orderId} verified and activated!`, 'success');
    return { success: true, message: `Webhook processed for ${customerEmail}` };
  };

  const manualApproveClaimAdmin = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;

    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, claim_status: 'verified', verified_at: new Date().toISOString() } : c));
    grantEntitlementAtomic(claim.user_id, 'gpt-storyboard', 'gpt-storyboard-lifetime', null, 'admin_manual_claim_approval');
    showToast(`Admin approved claim for order ${claim.order_id}`, 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        mode,
        config,
        products: INITIAL_PRODUCTS,
        plans: INITIAL_PLANS,
        purchases,
        entitlements,
        wallet: userWallet,
        transactions,
        claims,
        mcpLogs,
        savedStoryboards,
        toasts,
        showToast,
        dismissToast,
        setMode,
        updateConfig,
        switchDemoUser,
        loginWithEmail,
        signOut,
        spendCredits,
        claimOrder,
        verifyClaimOtp,
        saveStoryboard,
        grantEntitlementAdmin,
        revokeEntitlementAdmin,
        addCreditsAdmin,
        simulateBclWebhook,
        manualApproveClaimAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
