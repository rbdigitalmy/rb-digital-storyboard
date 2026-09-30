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
  const [isAdmin, setIsAdmin] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');
  const [requests, setRequests] = useState<{user_id: string; status: string; profiles: {email: string} | null}[]>([]);
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { if (mounted) { setAccount(null); setIsAdmin(false); } return; }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Sesi tamat. Sambung semula melalui ChatGPT.');
        const { data, error: accessError } = await supabase.from('entitlements').select('expires_at')
          .eq('user_id', user.id).eq('product_id', 'gpt-storyboard').eq('status', 'active').maybeSingle();
        if (accessError) throw new Error('Status pembelian belum dapat disemak. Cuba semula nanti.');
        const {data: profile} = await supabase.from('profiles').select('role').eq('id',user.id).single();
        const admin = profile?.role === 'admin';
        const {data: request, error: requestError} = await supabase.from('access_requests').select('status').eq('user_id',user.id).maybeSingle();
        if (requestError) throw new Error('Tidak dapat membaca permohonan akses. Cuba semula.');
        if (mounted) { setIsAdmin(admin); setRequestStatus(request?.status || ''); }
        if (admin) {
          const {data: queue, error: queueError} = await supabase.from('access_requests').select('user_id,status,profiles!access_requests_user_id_fkey(email)').order('created_at',{ascending:false});
          if (queueError) throw new Error('Senarai permohonan tidak dapat dimuatkan.');
          if (mounted) setRequests((queue || []) as unknown as typeof requests);
        }
        if (mounted) setAccount({email: user.email || '', active: Boolean(data && (!data.expires_at || new Date(data.expires_at) > new Date()))});
      } catch (err) { if (mounted) { setAccount(null); setIsAdmin(false); setError(err instanceof Error ? err.message : 'Tidak dapat menyemak akses.'); } }
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
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}${base}/oauth/consent?portal=1`,
    } });
    setMessage(error ? 'Tidak dapat hantar pautan login. Cuba semula nanti.' : 'Semak inbox emel dan klik pautan login. Selepas login, mohon kelulusan admin.');
    setSending(false);
  }
  async function requestAccess() {
    setSending(true);
    const {data:{user}} = await supabase.auth.getUser();
    if (!user) { setSending(false); return; }
    const {error} = await supabase.from('access_requests').insert({user_id:user.id});
    setMessage(error ? 'Permohonan tidak dapat dihantar. Cuba muat semula.' : 'Permohonan dihantar. Tunggu kelulusan admin.');
    setSending(false); setRevision((v)=>v+1);
  }
  async function review(userId:string, approved:boolean) {
    setSending(true);
    const {error} = await supabase.rpc('review_access_request',{p_user_id:userId,p_approved:approved});
    setMessage(error ? 'Kelulusan gagal. Cuba semula.' : approved ? 'Akses diluluskan.' : 'Akses ditolak / dibatalkan.');
    setSending(false); setRevision((v)=>v+1);
  }
  return <div className="portal max-w-4xl mx-auto px-6 py-16 sm:py-24">
    <p className="text-xs font-semibold uppercase tracking-[.2em] text-red-600">GPT Storyboard</p>
    <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mt-5">Idea kau.<br />Storyboard dalam ChatGPT.</h1>
    <p className="text-slate-500 leading-relaxed mt-6 max-w-lg">Workflow kreatif RB Digital untuk video pendek, visual produk dan kempen. Sambung sekali, kemudian terus berkarya dalam chat.</p>
    <p className="text-sm text-slate-600 mt-8">Login portal dengan emel pembelian untuk mendapatkan URL MCP.</p>
    <p className="text-xs text-slate-400 mt-3">Kelulusan admin diperlukan. Tiada kredit atau top-up.</p>
    <section className="mt-14 border-t border-slate-200 pt-7" aria-label="Status akaun">
      <h2 className="text-sm font-semibold">Akses akaun</h2>
      {loading ? <p className="text-sm text-slate-500 mt-3">Menyemak sesi…</p> : error ? <p role="alert" className="text-sm text-amber-700 mt-3">{error}</p> : account ? <div className="mt-3">
        <p className="text-sm text-slate-600">{account.email}</p>
        <p className={`text-sm mt-2 ${account.active ? 'text-emerald-700' : 'text-amber-700'}`}>{account.active ? 'Akses aktif.' : requestStatus === 'pending' ? 'Menunggu kelulusan admin.' : requestStatus === 'rejected' ? 'Permohonan ditolak. Hubungi admin untuk semakan.' : 'Login berjaya. Mohon akses untuk semakan admin.'}</p>
        {!account.active && !requestStatus && <button disabled={sending} onClick={requestAccess} className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-full text-sm">Mohon akses</button>}
        <button onClick={()=>setRevision(v=>v+1)} className="text-xs text-blue-600 ml-4">Semak semula</button>
        <button className="text-xs underline text-slate-400 mt-4" onClick={async () => { const {error} = await supabase.auth.signOut(); if (error) setError('Tidak dapat log keluar. Cuba semula.'); else setAccount(null); }}>Log keluar</button>
      </div> : <form onSubmit={login} className="mt-4 max-w-md space-y-3">
        <label htmlFor="purchase-email" className="block text-sm text-slate-600">Emel pembelian</label>
        <input id="purchase-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@emel.com" className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm" />
        <button disabled={sending} className="bg-slate-900 text-white rounded-lg px-5 py-3 text-sm disabled:opacity-50">{sending ? 'Menghantar…' : 'Hantar pautan login'}</button>
      </form>}
      {message && <p role="status" className="text-sm text-slate-500 mt-3">{message}</p>}
    </section>
    {isAdmin && <section className="admin-panel mt-10" aria-label="Kelulusan admin">
      <h2 className="text-xl font-semibold">Kelulusan akses</h2><p className="text-sm text-slate-500 mt-2">Semak emel pembeli, kemudian approve atau tolak akses.</p>
      {requests.length === 0 && <p className="text-sm mt-5 text-slate-400">Belum ada permohonan.</p>}
      {requests.map(request=><div key={request.user_id} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 py-4 mt-3">
        <div><p className="text-sm font-medium">{request.profiles?.email || request.user_id}</p><p className="text-xs text-slate-400 mt-1">{request.status}</p></div>
        <div className="flex gap-2"><button disabled={sending} onClick={()=>review(request.user_id,true)} className="bg-blue-600 text-white rounded-full px-4 py-2 text-xs">Approve</button><button disabled={sending} onClick={()=>review(request.user_id,false)} className="bg-slate-100 rounded-full px-4 py-2 text-xs">Tolak / batal</button></div>
      </div>)}
    </section>}
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
        <li>Login portal dengan emel pembelian dan mohon akses. Tunggu admin approve.</li>
        <li>Dalam ChatGPT, buka Plugins → Add → New Plugin. Nama: GPT STORYBOARD. Tampal URL dalam Server URL.</li>
        <li>Pilih Authentication: OAuth. Selesaikan authorization menggunakan emel pembelian yang sama.</li>
        <li>Buka chat baharu, pilih plugin dan minta ChatGPT semak akses serta buat storyboard.</li>
      </ol>
      <p className="text-xs text-slate-400 mt-5">MCP menyemak akses dan menyediakan panduan. ChatGPT menghasilkan kandungan mengikut pelan serta had akaun ChatGPT kau.</p>
    </section>
  </div>;
}
