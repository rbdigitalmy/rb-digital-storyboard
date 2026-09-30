import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, ShieldCheck, Zap, ArrowRight, Clock,
  Coins, PlusCircle, CheckCircle2, ChevronRight,
  ExternalLink, Download, FileText, Film, Eye
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { BuyCreditsModal } from '../components/BuyCreditsModal';
import { StoryboardResult } from '../types';

export const Home: React.FC = () => {
  const {
    currentUser, wallet, entitlements, purchases,
    transactions, savedStoryboards, plans
  } = useAuth();

  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [selectedStoryboard, setSelectedStoryboard] = useState<StoryboardResult | null>(null);

  // User active entitlements
  const userEntitlements = entitlements.filter(
    e => e.user_id === currentUser?.id && e.status === 'active'
  );
  const activePlanId = userEntitlements[0]?.plan_id;
  const activePlan = plans.find(p => p.id === activePlanId);

  // User purchases
  const userPurchases = purchases.filter(p => p.user_id === currentUser?.id);

  // User transactions
  const userTransactions = transactions.filter(t => t.user_id === currentUser?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RB Digital Creative Engine v0.1.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {currentUser?.full_name || 'Creator'}!
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Your command center for high-converting TikTok & Reels storyboards, ChatGPT MCP plugins, and automated BCL license access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Storyboard Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/claim"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/10 transition-all"
            >
              <span>Claim BCL Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Entitlements + Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Entitlement Status Card */}
        <div className="lg:col-span-2 card-apple relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Active Entitlement</h3>
                  <p className="text-xs text-slate-500">Verified access status across plugins & MCP</p>
                </div>
              </div>

              {userEntitlements.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Active License
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  No Active Plan
                </span>
              )}
            </div>

            {userEntitlements.length > 0 ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/80 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                      Product
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                      RB Digital Storyboard Suite
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Tier: <strong className="text-slate-800 font-semibold">{activePlan?.name || 'Lifetime Pass'}</strong>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-medium text-slate-500">Expires At</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {userEntitlements[0]?.expires_at ? formatDate(userEntitlements[0].expires_at) : 'Lifetime (Never Expires)'}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
                      Granted via {userEntitlements[0]?.granted_by}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-600">
                    <span>✓ 19 Specialized Workflows</span>
                    <span>✓ Midjourney Prompt Engine</span>
                    <span>✓ ChatGPT Plugin Sync</span>
                  </div>
                  <Link
                    to="/plugin-setup"
                    className="font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                  >
                    Configure ChatGPT Plugin <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-center mb-4 space-y-3">
                <p className="text-sm text-slate-700 font-medium">
                  You don't have an active license yet. Have you purchased via BCL Malaysia?
                </p>
                <div className="flex justify-center gap-3">
                  <Link to="/claim" className="btn-primary text-xs py-2 px-3.5">
                    Claim BCL Order Now
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>License ID: <code className="font-mono text-[11px] text-slate-700">{userEntitlements[0]?.id || 'N/A'}</code></span>
            <a
                href={`${import.meta.env.BASE_URL}rb-digital-storyboard-suite-0.2.0.zip`}
              download
              className="font-medium text-slate-700 hover:text-red-600 inline-flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Plugin Package
            </a>
          </div>
        </div>

        {/* Credit Wallet Card */}
        <div className="card-apple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Credit Wallet</h3>
                  <p className="text-xs text-slate-500">Generation balance</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreditsOpen(true)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Top Up
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-inner mb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="text-xs font-medium text-slate-400">Available Balance</div>
              <div className="text-3xl font-extrabold text-white tracking-tight mt-1 flex items-baseline gap-1.5">
                <span>{wallet?.balance.toLocaleString() ?? 0}</span>
                <span className="text-xs font-normal text-amber-400">Credits</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-400">Total Earned</div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {wallet?.total_earned.toLocaleString() ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Total Spent</div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {wallet?.total_spent.toLocaleString() ?? 0}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Standard storyboard generation uses <strong>10 credits</strong> (4-8 scenes) or <strong>20 credits</strong> (12-24 scenes). Lifetime pass includes 5,000 initial credits.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Instant FPX via BCL</span>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              View Packs →
            </button>
          </div>
        </div>
      </div>

      {/* Feature Tiles / Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link
          to="/studio"
          className="card-apple group hover:border-red-500/40 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-1.5">
              19-Workflow Storyboard Studio
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate scene-by-scene scripts, camera moves, viral Malay dialogues, and Midjourney image/video prompts in seconds.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-red-600 flex items-center gap-1">
            Launch Generator Studio →
          </div>
        </Link>

        <Link
          to="/claim"
          className="card-apple group hover:border-amber-500/40 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-1.5">
              Claim Past BCL Order
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bought previously via BCL Malaysia? Enter your Order ID and email to instantly verify and link your Lifetime Pass.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-amber-600 flex items-center gap-1">
            Reconcile Order ID →
          </div>
        </Link>

        <Link
          to="/plugin-setup"
          className="card-apple group hover:border-indigo-500/40 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ExternalLink className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-1.5">
              ChatGPT Plugin & MCP Guide
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect RB Digital to ChatGPT Plus/Team or Claude Desktop via OAuth PKCE or Model Context Protocol endpoint.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-indigo-600 flex items-center gap-1">
            View Connection Guide →
          </div>
        </Link>
      </div>

      {/* Recent Generations & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Storyboards */}
        <div className="card-apple">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Film className="w-4 h-4 text-red-600" />
              Recent Storyboards
            </h3>
            <Link to="/studio" className="text-xs font-medium text-red-600 hover:text-red-700">
              Create New →
            </Link>
          </div>

          {savedStoryboards.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {savedStoryboards.slice(0, 4).map((sb) => (
                <div key={sb.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {sb.topic}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">{sb.style}</span>
                      <span>•</span>
                      <span>{sb.duration} ({sb.scenes.length} Scenes)</span>
                      <span>•</span>
                      <span>{formatDate(sb.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStoryboard(sb)}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <Film className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No storyboards generated yet. Head over to the Studio to generate your first viral script!</p>
              <Link to="/studio" className="btn-primary text-xs py-1.5 px-3 inline-block mt-2">
                Open Studio
              </Link>
            </div>
          )}
        </div>

        {/* Credit Transactions Ledger */}
        <div className="card-apple">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Credit & Usage History
            </h3>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Top Up →
            </button>
          </div>

          {userTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {userTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-800">{tx.description}</div>
                    <div className="text-[11px] text-slate-400">{formatDate(tx.created_at)}</div>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-slate-700'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credits
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              No transactions recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Storyboard View Modal */}
      {selectedStoryboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedStoryboard.topic}</h3>
                <p className="text-xs text-slate-500">
                  {selectedStoryboard.style} • {selectedStoryboard.duration} • {selectedStoryboard.language}
                </p>
              </div>
              <button
                onClick={() => setSelectedStoryboard(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {selectedStoryboard.scenes.map((scene) => (
                <div key={scene.scene_number} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Scene {scene.scene_number} ({scene.timeframe})</span>
                    <span className="text-red-600">{scene.emotion}</span>
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong>Action:</strong> {scene.visual}
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong>Camera:</strong> {scene.camera}
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs italic text-slate-800">
                    "{scene.dialogue}"
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedStoryboard(null)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Top Up Modal */}
      <BuyCreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
    </div>
  );
};
