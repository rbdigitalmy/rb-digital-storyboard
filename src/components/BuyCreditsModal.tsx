import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addCreditsAdmin, showToast } = useAuth();
  const [selectedPack, setSelectedPack] = useState<number>(1500);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const packs = [
    { credits: 500, price: 29, badge: 'Starter', popular: false },
    { credits: 1500, price: 69, badge: 'Most Popular', popular: true },
    { credits: 5000, price: 149, badge: 'Best Value', popular: false },
  ];

  const handlePurchase = () => {
    if (!currentUser) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      addCreditsAdmin(currentUser.id, selectedPack, `Credit Top-Up Pack (${selectedPack} Credits)`);
      showToast(`Payment of ${formatCurrency(packs.find(p => p.credits === selectedPack)?.price || 0)} successful via BCL! +${selectedPack} Credits added.`, 'success');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Top Up Storyboard Credits</h3>
              <p className="text-xs text-slate-500">Instant top-up via BCL Malaysia FPX</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {packs.map((pack) => (
              <div
                key={pack.credits}
                onClick={() => setSelectedPack(pack.credits)}
                className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPack === pack.credits
                    ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-2.5 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {pack.badge}
                  </span>
                )}
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    {pack.credits.toLocaleString()} Credits
                  </div>
                  <div className="text-xs text-slate-500">
                    ~ {Math.floor(pack.credits / 10)} Viral Storyboard Generations
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900">
                    {formatCurrency(pack.price)}
                  </div>
                  <div className="text-[11px] text-slate-400">One-time payment</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted FPX checkout supported by BCL Malaysia. Credits credited immediately.</span>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>Processing BCL Payment...</>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Pay {formatCurrency(packs.find(p => p.credits === selectedPack)?.price || 0)} Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
