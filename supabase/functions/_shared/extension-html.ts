import { getEnv } from "./env.ts";

export function storyboardStudioHtml(requestOrigin: string): string {
  const publicOrigin = getEnv("PUBLIC_BASE_URL") || "https://rbdigitalmy.github.io/rb-digital-storyboard";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>RB Digital Storyboard</title>
  <style>
    :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color-scheme:light dark;--red:#dc2626;--bg:#f8fafc;--card:#fff;--text:#0f172a;--muted:#64748b;--line:#e2e8f0}
    @media(prefers-color-scheme:dark){:root{--bg:#090f1d;--card:#111827;--text:#f8fafc;--muted:#94a3b8;--line:#25324a}}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text)}main{max-width:1100px;margin:auto;padding:24px}.hero{background:linear-gradient(135deg,#0f172a,#020617);color:#fff;border-radius:24px;padding:24px;margin-bottom:18px}.eyebrow{color:#f87171;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1{margin:6px 0;font-size:30px}.sub{color:#cbd5e1;margin:0}.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}@media(max-width:760px){.grid{grid-template-columns:1fr}}.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:18px;box-shadow:0 8px 30px #0000000d}label{display:block;font-size:12px;font-weight:750;color:var(--muted);margin:13px 0 6px}input,select,textarea,button{font:inherit}input,select,textarea{width:100%;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--text);padding:11px 12px}textarea{min-height:100px;resize:vertical}.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.styles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.style{padding:10px 8px;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--text);cursor:pointer}.style.active{border-color:var(--red);background:#dc262611;color:#ef4444}.primary{width:100%;border:0;border-radius:13px;background:var(--red);color:white;font-weight:800;padding:13px;margin-top:16px;cursor:pointer}.primary:disabled{opacity:.55;cursor:wait}.status{font-size:13px;color:var(--muted);margin-top:10px}.scene{border-left:3px solid var(--red);padding:10px 12px;margin:10px 0;background:#64748b0d;border-radius:0 12px 12px 0}.scene h3{font-size:14px;margin:0 0 5px}.scene p{font-size:12px;line-height:1.5;margin:4px 0;color:var(--muted)}.access{display:flex;justify-content:space-between;gap:8px;align-items:center}.pill{padding:5px 9px;border-radius:999px;font-size:11px;font-weight:800}.ok{background:#10b9811a;color:#10b981}.no{background:#f59e0b1a;color:#f59e0b}.empty{display:grid;place-items:center;min-height:260px;text-align:center;color:var(--muted)}
  </style>
</head>
<body>
<main>
  <section class="hero"><div class="eyebrow">RB Digital Creative Engine</div><h1>GPT Storyboard Studio</h1><p class="sub">19 production-ready workflows for TikTok, Reels and Shorts.</p></section>
  <div class="grid">
    <form id="storyboard-form" class="card">
      <div class="access"><strong>Create storyboard</strong><span id="access-pill" class="pill">Checking access</span></div>
      <label for="topic">What do you want to create?</label><textarea id="topic" required placeholder="Describe your product, audience and desired story..."></textarea>
      <label>Visual workflow</label><div id="styles" class="styles"></div>
      <div class="row"><div><label for="duration">Duration</label><select id="duration"><option>10s</option><option>20s</option><option>30s</option><option>60s</option></select></div><div><label for="language">Language</label><select id="language"><option>Malay</option><option>English</option></select></div></div>
      <div class="row"><div><label for="ratio">Ratio</label><select id="ratio"><option>9:16</option><option>16:9</option><option>1:1</option></select></div><div><label for="audience">Audience</label><input id="audience" value="General Audience" /></div></div>
      <button id="generate" class="primary" type="submit">Create with ChatGPT</button><div id="status" class="status"></div>
    </form>
    <section id="result" class="card empty"><div><strong>ChatGPT creates your storyboard in chat</strong><p>Sign in with your purchase email. No RB Digital credits or separate AI API required.</p></div></section>
  </div>
</main>
<script src="${publicOrigin}/extension/app.js"></script>
</body></html>`;
}


