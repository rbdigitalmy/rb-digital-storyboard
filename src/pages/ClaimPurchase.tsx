import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Zap, KeyRound, CheckCircle2,
  AlertCircle, HelpCircle, ArrowRight, RefreshCw, Mail
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

export const ClaimPurchase: React.FC = () => {
  const { currentUser, claims, claimOrder, verifyClaimOtp, showToast } = useAuth();
  
  const [orderId, setOrderId] = useState('');
  const [purchaseEmail, setPurchaseEmail] = useState(currentUser?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [activeClaimOrderId, setActiveClaimOrderId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Quick fill sample orders
  const fillSampleOrder = (id: string, email: string) => {
    setOrderId(id);
    setPurchaseEmail(email);
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !purchaseEmail.trim()) {
      showToast('Please enter both Order ID and Purchase Email', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await claimOrder(orderId.trim(), purchaseEmail.trim());
      setIsSubmitting(false);

      if (res.requiresVerification) {
        setActiveClaimOrderId(orderId.trim());
        setShowOtpModal(true);
      } else if (res.success) {
        setOrderId('');
      }
    } catch {
      setIsSubmitting(false);
      showToast('Claim submission failed', 'error');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsVerifyingOtp(true);
    const res = await verifyClaimOtp(activeClaimOrderId, otpCode.trim());
    setIsVerifyingOtp(false);

    if (res.success) {
      setShowOtpModal(false);
      setOtpCode('');
      setOrderId('');
    }
  };

  const userClaims = claims.filter(c => c.user_id === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5" /> BCL Malaysia Order Reconciliation
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Claim Past Purchase & Unlock License
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Purchased RB Digital Storyboard Suite through BCL Malaysia or FPX? Reconcile your Order ID below to bind the Lifetime Pass to your account immediately.
        </p>
      </div>

      {/* Main Claim Card */}
      <div className="card-apple">
        <form onSubmit={handleClaim} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                BCL Order ID / Transaction Ref <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. BCL-2026-98412"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-mono uppercase"
                required
              />
              <p className="text-[11px] text-slate-400">
                Found in your receipt email from BCL Malaysia.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Email Used During Checkout <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={purchaseEmail}
                onChange={(e) => setPurchaseEmail(e.target.value)}
                placeholder="e.g. your-email@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                required
              />
              <p className="text-[11px] text-slate-400">
                The email address you entered on the payment page.
              </p>
            </div>
          </div>

          {/* Quick Demo Pre-fill Links */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Quick Sandbox Tests:</span>
            <button
              type="button"
              onClick={() => fillSampleOrder('BCL-2026-98412', currentUser?.email || 'customer@rbdigital.com')}
              className="text-red-600 hover:underline font-mono"
            >
              Order: BCL-2026-98412 (Direct Match)
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => fillSampleOrder('BCL-2026-55910', 'different.email@domain.my')}
              className="text-amber-600 hover:underline font-mono"
            >
              Order: BCL-2026-55910 (Triggers OTP Flow)
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-3 px-6 text-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Order with BCL...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Verify & Unlock License
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Claim History */}
      <div className="card-apple">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-slate-600" />
          Your Claim History
        </h3>

        {userClaims.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {userClaims.map((claim) => (
              <div key={claim.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{claim.order_id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        claim.claim_status === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : claim.claim_status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {claim.claim_status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Email: {claim.purchase_email} • Claimed: {formatDate(claim.created_at)}
                  </div>
                </div>

                {claim.claim_status === 'verified' ? (
                  <Link
                    to="/studio"
                    className="text-red-600 font-semibold inline-flex items-center gap-1 hover:text-red-700"
                  >
                    Open Studio <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setActiveClaimOrderId(claim.order_id);
                      setShowOtpModal(true);
                    }}
                    className="btn-secondary text-[11px] py-1 px-2.5"
                  >
                    Enter OTP Code
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No previous claims submitted yet.
          </div>
        )}
      </div>

      {/* How it works FAQ */}
      <div className="card-apple bg-slate-50/60 border-slate-200/80">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div>
            <strong className="text-slate-800">What if my BCL checkout email is different from my login email?</strong>
            <p className="mt-0.5">
              No problem! Enter the email address you used at checkout. A 6-digit confirmation code will be sent to that address to verify ownership.
            </p>
          </div>
          <div>
            <strong className="text-slate-800">Where can I find my BCL Order ID?</strong>
            <p className="mt-0.5">
              Check your email for the subject line "Resit Pembayaran BCL" or "Order Confirmation". The order ID format is usually <code>BCL-XXXX-XXXXX</code>.
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Enter Verification OTP</h3>
                  <p className="text-xs text-slate-500">Order: {activeClaimOrderId}</p>
                </div>
              </div>
              <button
                onClick={() => setShowOtpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Please enter the 6-digit verification code sent to your purchase email address.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-widest text-xl font-bold py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5"
                >
                  {isVerifyingOtp ? 'Verifying...' : 'Confirm Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
