import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Users, CreditCard, KeyRound, Terminal,
  PlusCircle, CheckCircle2, XCircle, Search, Filter,
  RefreshCw, DollarSign, Zap, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { Profile, Plan } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser, purchases, entitlements, claims, mcpLogs,
    plans, grantEntitlementAdmin, revokeEntitlementAdmin,
    addCreditsAdmin, simulateBclWebhook, manualApproveClaimAdmin,
    showToast
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'claims' | 'logs' | 'webhook'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [grantModalUser, setGrantModalUser] = useState<Profile | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('gpt-storyboard-lifetime');
  const [creditAdjustUser, setCreditAdjustUser] = useState<Profile | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(500);
  const [creditNote, setCreditNote] = useState<string>('Support grant bonus');

  // Webhook simulator state
  const [simOrderId, setSimOrderId] = useState(`BCL-${Date.now().toString().slice(-5)}`);
  const [simEmail, setSimEmail] = useState('newbuyer@gmail.com');
  const [simPlanId, setSimPlanId] = useState('gpt-storyboard-lifetime');
  const [simAmount, setSimAmount] = useState(199.00);
  const [isSimulating, setIsSimulating] = useState(false);

  // Compute metrics
  const totalRevenue = purchases
    .filter(p => p.verified_payment_status === 'verified')
    .reduce((acc, p) => acc + p.amount, 0);

  const activeEntitlementsCount = entitlements.filter(e => e.status === 'active').length;
  const pendingClaimsCount = claims.filter(c => c.claim_status === 'pending').length;

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantModalUser) return;
    const plan = plans.find(p => p.id === selectedPlanId);
    grantEntitlementAdmin(grantModalUser.id, 'gpt-storyboard', selectedPlanId, plan?.duration_days || null);
    setGrantModalUser(null);
  };

  const handleAdjustCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditAdjustUser) return;
    addCreditsAdmin(creditAdjustUser.id, creditAmount, creditNote);
    setCreditAdjustUser(null);
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    await simulateBclWebhook(simOrderId, simEmail, simPlanId, simAmount);
    setIsSimulating(false);
    setSimOrderId(`BCL-${Date.now().toString().slice(-5)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-red-500" /> Super Admin Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            License & Entitlement Control Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time management for customer entitlements, BCL Malaysia transactions, customer claim verification, and MCP usage.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Verified Revenue (MYR)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            From BCL Malaysia FPX
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Licenses</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {activeEntitlementsCount}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Across {entitlements.length} total entries
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Pending Claims</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {pendingClaimsCount}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Customer order reconciliation
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">MCP Tool Invocations</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {mcpLogs.length}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Logged generation events
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Customers & Entitlements
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-2 font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" /> BCL Orders ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-2 font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'claims'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" /> Customer Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-2 font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" /> MCP Logs ({mcpLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('webhook')}
          className={`pb-3 px-2 font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'webhook'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" /> BCL Webhook Tester
        </button>
      </div>

      {/* Tab 1: Customers & Entitlements */}
      {activeTab === 'users' && (
        <div className="card-apple p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-sm">Customer Database</h3>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Entitlement Status</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {entitlements.map((ent) => (
                  <tr key={ent.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ent.user_id}</div>
                      <div className="text-[11px] text-slate-400">Granted by: {ent.granted_by}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Customer
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ent.plan_id}</div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ent.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {ent.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {ent.expires_at ? formatDate(ent.expires_at) : 'Lifetime'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setCreditAdjustUser({ id: ent.user_id, email: ent.user_id, full_name: ent.user_id, role: 'customer', created_at: '', updated_at: '' })}
                        className="text-red-600 hover:text-red-700 font-semibold"
                      >
                        Adjust Credits
                      </button>
                      {ent.status === 'active' ? (
                        <button
                          onClick={() => revokeEntitlementAdmin(ent.id)}
                          className="text-rose-600 hover:text-rose-700 font-medium"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => grantEntitlementAdmin(ent.user_id, 'gpt-storyboard', 'gpt-storyboard-lifetime', null)}
                          className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Ledger */}
      {activeTab === 'orders' && (
        <div className="card-apple p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">BCL Order & Payment Transactions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Purchased At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.provider_order_id}</td>
                    <td className="py-3 px-4 text-slate-500">{p.user_id}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{p.plan_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.amount, p.currency)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.verified_payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(p.purchased_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Customer Claims */}
      {activeTab === 'claims' && (
        <div className="card-apple p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Customer Order Claim Requests</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Purchase Email</th>
                  <th className="py-3 px-4">Claimed By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Claimed At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.order_id}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{c.purchase_email}</td>
                    <td className="py-3 px-4 text-slate-500">{c.user_id}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.claim_status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {c.claim_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(c.created_at)}</td>
                    <td className="py-3 px-4 text-right">
                      {c.claim_status === 'pending' && (
                        <button
                          onClick={() => manualApproveClaimAdmin(c.id)}
                          className="btn-primary text-[11px] py-1 px-2.5"
                        >
                          Approve Claim
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: MCP Usage Logs */}
      {activeTab === 'logs' && (
        <div className="card-apple p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">MCP Server Tool Execution Stream</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tool Name</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Credits Charged</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mcpLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{log.tool_name}</td>
                    <td className="py-3 px-4 text-slate-500">{log.user_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.credits_charged} Credits</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Webhook Tester */}
      {activeTab === 'webhook' && (
        <div className="card-apple max-w-xl space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Simulate Inbound BCL Webhook
            </h3>
            <p className="text-xs text-slate-500">
              Test end-to-end payment receipt, automatic account matching, and instant entitlement provisioning.
            </p>
          </div>

          <form onSubmit={handleSimulateWebhook} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Order ID</label>
              <input
                type="text"
                value={simOrderId}
                onChange={(e) => setSimOrderId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Customer Email</label>
              <input
                type="email"
                value={simEmail}
                onChange={(e) => setSimEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Plan</label>
                <select
                  value={simPlanId}
                  onChange={(e) => setSimPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="gpt-storyboard-lifetime">Lifetime Pass (RM 199)</option>
                  <option value="gpt-storyboard-annual">Annual Pass (RM 99)</option>
                  <option value="gpt-storyboard-starter">Starter Pass (RM 49)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Amount (MYR)</label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSimulating}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
              >
                {isSimulating ? 'Processing Webhook...' : 'Dispatch Webhook Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credit Adjust Modal */}
      {creditAdjustUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Adjust User Credits</h3>
              <button onClick={() => setCreditAdjustUser(null)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleAdjustCredits} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Credit Delta (+ to add, - to deduct)</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-base"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Audit Reason / Note</label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreditAdjustUser(null)}
                  className="px-4 py-2 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-4">
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
