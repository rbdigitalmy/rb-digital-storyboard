import React, { useState } from 'react';
import { Copy, Check, Download, Cpu, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MCP_ENDPOINT = 'https://klxzpyzgljvmsepvjhaz.supabase.co/functions/v1/mcp-server';
const PLUGIN_ZIP = `${import.meta.env.BASE_URL}rb-digital-storyboard-suite-0.2.0.zip`;

export const PluginSetup: React.FC = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'mcp' | 'chatgpt' | 'download'>('mcp');
  const [copied, setCopied] = useState(false);

  const copyEndpoint = async () => {
    await navigator.clipboard.writeText(MCP_ENDPOINT);
    setCopied(true);
    showToast('MCP endpoint copied', 'success');
    setTimeout(() => setCopied(false), 1800);
  };

  const tabs = [
    { id: 'mcp' as const, label: 'MCP Server', icon: Cpu },
    { id: 'chatgpt' as const, label: 'ChatGPT Extension', icon: Sparkles },
    { id: 'download' as const, label: 'Plugin Package', icon: Download },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Secure plugin connection
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Connect GPT Storyboard</h1>
        <p className="text-slate-500 text-sm mt-1">One hosted plugin with Supabase OAuth, BCL entitlement checks and the RB Digital Extension UI.</p>
      </div>

      <div className="flex items-center gap-5 border-b border-slate-200 text-sm overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`pb-3 font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === id ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'mcp' && (
        <div className="space-y-6">
          <div className="card-apple space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div><h3 className="font-bold text-slate-900">Production Streamable HTTP endpoint</h3><p className="text-xs text-slate-500">Hosted on Supabase Edge Functions</p></div>
              <button className="btn-secondary text-xs flex items-center gap-1.5" onClick={copyEndpoint}>{copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />} Copy</button>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl text-slate-200 font-mono text-xs break-all">{MCP_ENDPOINT}</div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {['open_storyboard_studio — Extension UI', 'generate_storyboard — protected generation', 'get_my_access — entitlement and wallet', 'get_my_usage — credit and activity history'].map((item) => <div key={item} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">{item}</div>)}
            </div>
          </div>
          <div className="card-apple text-sm text-slate-600 leading-relaxed">
            Compatible MCP clients should add the URL above as a remote Streamable HTTP server. OAuth discovery, PKCE and refresh-token rotation happen automatically through Supabase Auth—never paste an access token manually.
          </div>
        </div>
      )}

      {activeTab === 'chatgpt' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-apple space-y-4">
            <h3 className="font-bold text-slate-900">Native ChatGPT experience</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>✓ Sidebar entry opens Storyboard Studio fullscreen</li>
              <li>✓ Thread panel keeps the visual form beside the conversation</li>
              <li>✓ Native settings for language, ratio, style and duration</li>
              <li>✓ 19 visual workflow cards and production output</li>
            </ul>
          </div>
          <div className="card-apple space-y-4">
            <h3 className="font-bold text-slate-900">Connection flow</h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600">
              <li>Install the RB Digital plugin package.</li>
              <li>Open GPT Storyboard from the sidebar or mention it in a chat.</li>
              <li>Sign in using the email attached to your BCL purchase.</li>
              <li>Approve access; the MCP server verifies entitlement on every premium call.</li>
            </ol>
            <a href={MCP_ENDPOINT} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">MCP endpoint <ExternalLink className="w-3.5 h-3.5" /></a>
          </div>
        </div>
      )}

      {activeTab === 'download' && (
        <div className="card-apple">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-2xl bg-slate-950 text-white">
            <div><div className="text-[10px] font-bold uppercase tracking-wider text-red-400">Release v0.2.0</div><h3 className="text-xl font-bold mt-1">RB Digital Storyboard Suite</h3><p className="text-xs text-slate-300 mt-2">19 Skills, onboarding, MCP connection and Extension metadata.</p></div>
            <a href={PLUGIN_ZIP} download className="btn-primary py-3 px-5 text-sm inline-flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download plugin</a>
          </div>
        </div>
      )}
    </div>
  );
};
