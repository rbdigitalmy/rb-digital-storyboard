import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const pluginUrl = 'https://chatgpt.com/plugins/plugin_asdk_app_6abcc495abd881918745ba1eaae608d6';

export function Home() {
  const [account, setAccount] = useState<{email: string; active: boolean} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    return () => { mounted = false; };
  }, []);
  return <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
    <p className="text-xs font-semibold uppercase tracking-[.2em] text-red-600">GPT Storyboard</p>
    <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mt-5">Idea kau.<br />Storyboard dalam ChatGPT.</h1>
    <p className="text-slate-500 leading-relaxed mt-6 max-w-lg">Workflow kreatif RB Digital untuk video pendek, visual produk dan kempen. Sambung sekali, kemudian terus berkarya dalam chat.</p>
    <a href={pluginUrl} className="inline-flex bg-slate-900 text-white rounded-lg px-5 py-3 text-sm font-medium mt-8 hover:bg-slate-700">Sambung ke ChatGPT ↗</a>
    <p className="text-xs text-slate-400 mt-3">Pembelian sah diperlukan. Tiada kredit RB Digital atau top-up.</p>
    <section className="mt-14 border-t border-slate-200 pt-7" aria-label="Status akaun">
      <h2 className="text-sm font-semibold">Akses akaun</h2>
      {loading ? <p className="text-sm text-slate-500 mt-3">Menyemak sesi…</p> : error ? <p role="alert" className="text-sm text-amber-700 mt-3">{error}</p> : account ? <div className="mt-3">
        <p className="text-sm text-slate-600">{account.email}</p>
        <p className={`text-sm mt-2 ${account.active ? 'text-emerald-700' : 'text-amber-700'}`}>{account.active ? 'Pembelian disahkan. Akses aktif.' : 'Akses pembelian belum aktif. Pastikan emel ini sama dengan emel pembelian.'}</p>
        <button className="text-xs underline text-slate-400 mt-4" onClick={async () => { const {error} = await supabase.auth.signOut(); if (error) setError('Tidak dapat log keluar. Cuba semula.'); else setAccount(null); }}>Log keluar</button>
      </div> : <p className="text-sm text-slate-500 mt-3">Belum disambungkan. Login menggunakan emel pembelian melalui ChatGPT.</p>}
    </section>
    <section className="mt-10 border-t border-slate-200 pt-7">
      <h2 className="text-sm font-semibold">Cara guna</h2>
      <ol className="mt-4 space-y-3 text-sm text-slate-500 list-decimal pl-5">
        <li>Buka plugin dalam ChatGPT dan pilih Connect.</li>
        <li>Login dengan emel pembelian dan benarkan sambungan OAuth.</li>
        <li>Minta ChatGPT semak akses, kemudian beri idea storyboard kau.</li>
      </ol>
      <p className="text-xs text-slate-400 mt-5">MCP menyemak akses dan menyediakan panduan. ChatGPT menghasilkan kandungan mengikut pelan serta had akaun ChatGPT kau.</p>
    </section>
  </div>;
}
