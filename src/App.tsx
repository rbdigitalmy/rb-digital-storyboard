import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { OAuthConsent } from './pages/OAuthConsent';

export default function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <header className="border-b border-slate-100"><div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <Link to="/" className="font-semibold tracking-tight">RB Digital <span className="text-slate-400 font-normal">/ Storyboard</span></Link>
        <a href="https://chatgpt.com/plugins/plugin_asdk_app_6abcc495abd881918745ba1eaae608d6" className="text-sm text-slate-500">ChatGPT ↗</a>
      </div></header>
      <main className="flex-1"><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/oauth/consent" element={<OAuthConsent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></main>
      <footer className="max-w-3xl w-full mx-auto px-6 py-6 text-xs text-slate-400 border-t border-slate-100">RB Digital · Akses pembelian melalui OAuth · Kandungan dalam ChatGPT</footer>
    </div>
  </BrowserRouter>;
}
