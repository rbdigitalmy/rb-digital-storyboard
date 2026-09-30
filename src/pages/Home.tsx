import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const mcpUrl = 'https://klxzpyzgljvmsepvjhaz.supabase.co/functions/v1/mcp-server';

export function Home() {
  const [account, setAccount] = useState<{email: string; active: boolean} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Sesi tamat. Sambung semula melalui ChatGPT.');
        const { data, error: accessError } = await supabase.from('entitlements').select('expires_at')
          .eq('user_id', user.id).eq('product_id', 'gpt-storyboard').eq('status', 'active').maybeSingle();
        if (accessError) throw new Error('Status pembelian belum dapat disemak. Cuba semula nanti.');
        if (mounted) setAccount({email: user.email || '', active: Boolean(data && (!data.expires_at || new Date(data.expires_at) > new Date()))});
      } catch (err) { if (mounted) setError(err instanceof Error ? err.message : 'Tidak dapat menyemak akses.'); }
      finally { if (mounted) setLoading(false); }
    }
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') return;
      // Defer database calls until the auth event has released its lock.
      setTimeout(() => { if (mounted) setRevision((value) => value + 1); }, 0);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [revision]);
  async function login(event: React.FormEvent) {
    event.preventDefault();
    setSending(true); setMessage('');
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: {
      shouldCreateUser: false,
      emailRedirectTo: `${window.location.origin}${base}/oauth/consent?portal=1`,
    } });
    setMessage(error ? 'Tidak dapat hantar pautan login. Pastikan pembelian telah didaftarkan, atau cuba semula nanti.' : 'Semak inbox emel pembelian dan klik pautan login.');
    setSending(false);
  }
  return <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
    <p className="text-xs font-semibold uppercase tracking-[.2em] text-red-600">GPT Storyboard</p>
    <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mt-5">Idea kau.<br />Storyboard dalam ChatGPT.</h1>
    <p className="text-slate-500 leading-relaxed mt-6 max-w-lg">Workflow kreatif RB Digital untuk video pendek, visual produk dan kempen. Sambung sekali, kemudian terus berkarya dalam chat.</p>
    <p className="text-sm text-slate-600 mt-8">Login portal dengan emel pembelian untuk mendapatkan URL MCP.</p>
    <p className="text-xs text-slate-400 mt-3">Pembelian sah diperlukan. Tiada kredit RB Digital atau top-up.</p>
    <section className="mt-14 border-t border-slate-200 pt-7" aria-label="Status akaun">
      <h2 className="text-sm font-semibold">Akses akaun</h2>
      {loading ? <p className="text-sm text-slate-500 mt-3">Menyemak sesi…</p> : error ? <p role="alert" className="text-sm text-amber-700 mt-3">{error}</p> : account ? <div className="mt-3">
        <p className="text-sm text-slate-600">{account.email}</p>
        <p className={`text-sm mt-2 ${account.active ? 'text-emerald-700' : 'text-amber-700'}`}>{account.active ? 'Pembelian disahkan. Akses aktif.' : 'Akses pembelian belum aktif. Pastikan emel ini sama dengan emel pembelian.'}</p>
        <button className="text-xs underline text-slate-400 mt-4" onClick={async () => { const {error} = await supabase.auth.signOut(); if (error) setError('Tidak dapat log keluar. Cuba semula.'); else setAccount(null); }}>Log keluar</button>
      </div> : <form onSubmit={login} className="mt-4 max-w-md space-y-3">
        <label htmlFor="purchase-email" className="block text-sm text-slate-600">Emel pembelian</label>
        <input id="purchase-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@emel.com" className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm" />
        <button disabled={sending} className="bg-slate-900 text-white rounded-lg px-5 py-3 text-sm disabled:opacity-50">{sending ? 'Menghantar…' : 'Hantar pautan login'}</button>
      </form>}
      {message && <p role="status" className="text-sm text-slate-500 mt-3">{message}</p>}
    </section>
    {account?.active && <section className="mt-10 border-t border-slate-200 pt-7">
      <h2 className="text-sm font-semibold">Sambungan MCP</h2>
      <label htmlFor="mcp-url" className="block text-xs text-slate-500 mt-4">Server URL</label>
      <input id="mcp-url" readOnly value={mcpUrl} className="w-full border border-slate-200 rounded-lg px-3 py-3 text-xs mt-2" />
      <button onClick={async () => { try { await navigator.clipboard.writeText(mcpUrl); setMessage('URL MCP disalin.'); } catch { setMessage('Pilih URL di atas dan salin secara manual.'); } }} className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm mt-3">Salin URL MCP</button>
      <a href="https://chatgpt.com/plugins" className="text-sm underline text-slate-500 ml-4">Buka Plugins ↗</a>
      <p className="text-xs text-slate-400 mt-4">URL yang sama digunakan semua pembeli. OAuth menyemak emel dan akses pembelian; URL sahaja tidak memberikan akses.</p>
    </section>}
    <section className="mt-10 border-t border-slate-200 pt-7">
      <h2 className="text-sm font-semibold">Cara guna</h2>
      <ol className="mt-4 space-y-3 text-sm text-slate-500 list-decimal pl-5">
        <li>Login portal menggunakan emel pembelian. URL MCP muncul selepas akses disahkan.</li>
        <li>Dalam ChatGPT, buka Plugins → Add → New Plugin. Nama: GPT STORYBOARD. Tampal URL dalam Server URL.</li>
        <li>Pilih Authentication: OAuth. Selesaikan authorization menggunakan emel pembelian yang sama.</li>
        <li>Buka chat baharu, pilih plugin dan minta ChatGPT semak akses serta buat storyboard.</li>
      </ol>
      <p className="text-xs text-slate-400 mt-5">MCP menyemak akses dan menyediakan panduan. ChatGPT menghasilkan kandungan mengikut pelan serta had akaun ChatGPT kau.</p>
    </section>
  </div>;
}
