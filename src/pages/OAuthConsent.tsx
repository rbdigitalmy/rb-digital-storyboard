import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AuthorizationDetails = {
  authorization_id: string;
  client: { name?: string; client_name?: string; uri?: string };
  redirect_uri: string;
  scope: string;
  user: { email: string };
};

export const OAuthConsent: React.FC = () => {
  const authorizationId = useMemo(() => new URLSearchParams(window.location.search).get('authorization_id') || '', []);
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!authorizationId) {
        setMessage('Missing OAuth authorization request.');
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (error || !data) {
        setMessage(error?.message || 'Unable to load authorization request.');
      } else if ('redirect_url' in data) {
        window.location.assign(data.redirect_url);
        return;
      } else {
        setDetails(data as AuthorizationDetails);
      }
      setLoading(false);
    };
    void load();
  }, [authorizationId]);

  const sendMagicLink = async () => {
    setLoading(true);
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const returnUrl = `${window.location.origin}${basePath}/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: returnUrl } });
    setMessage(error ? error.message : 'Check your email for the secure sign-in link, then return here.');
    setLoading(false);
  };

  const decide = async (approved: boolean) => {
    setLoading(true);
    const result = approved
      ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
      : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
    if (result.error || !result.data) {
      setMessage(result.error?.message || 'Unable to complete authorization.');
      setLoading(false);
      return;
    }
    window.location.assign(result.data.redirect_url);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="card-apple p-8 space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">Secure account connection</p>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Connect GPT Storyboard</h1>
          <p className="text-sm text-slate-500 mt-2">ChatGPT is requesting permission to use your RB Digital account.</p>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading secure authorization…</p>}

        {!loading && !details && !message && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700">Your RB Digital email</label>
            <input className="input-apple w-full" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            <button className="btn-primary w-full" onClick={sendMagicLink} disabled={!email}>Send secure sign-in link</button>
          </div>
        )}

        {details && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="font-bold text-slate-900">{details.client.name || details.client.client_name || 'ChatGPT MCP Client'}</div>
              <div className="text-xs text-slate-500 mt-1">Signed in as {details.user.email}</div>
              <div className="mt-4 text-xs font-semibold text-slate-700">Requested permissions</div>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {details.scope.split(' ').filter(Boolean).map((scope) => <li key={scope}>✓ {scope}</li>)}
              </ul>
              <div className="mt-4 flex items-center gap-1 text-[11px] text-slate-400"><ExternalLink className="w-3 h-3" /> Redirects only to the registered client URL.</div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" onClick={() => decide(false)}>Deny</button>
              <button className="btn-primary flex-1" onClick={() => decide(true)}>Allow access</button>
            </div>
          </div>
        )}

        {message && <div className="flex gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800"><AlertCircle className="w-4 h-4 shrink-0" />{message}</div>}
      </div>
    </div>
  );
};
