# RB Digital GPT Storyboard — Implementation Status

## Target architecture

`BCL → Supabase Auth/Postgres/Edge MCP → GitHub Pages Extension UI → ChatGPT`

## Completed

- Production RLS, entitlement, wallet and idempotent credit enforcement.
- Supabase Auth OAuth 2.1 with PKCE, consent UI and dynamic client registration.
- Supabase Streamable HTTP MCP server with OAuth protected-resource metadata.
- Server-side bearer validation using an RLS-scoped Supabase client.
- Sidebar, thread, settings and fullscreen Extension metadata.
- Visual Extension UI and all 19 protected RB Digital workflows.
- GitHub Pages Vite base, SPA fallback and deployment workflow.
- Portable plugin package v0.2.0 pointing directly to the Supabase MCP URL.
- Removal of all Netlify functions, configuration and dependencies.
- Public GitHub repository connected and GitHub Pages deployed successfully.
- Supabase Site URL, OAuth authorization path and GitHub Pages redirect added.
- Retired Netlify callback removed from the Supabase redirect allowlist.

## Production verification remaining

1. Run the full OAuth, entitlement and generation flow with a paid test user.

## Verification gates

- Unauthenticated MCP requests return `401` and a valid
  `WWW-Authenticate` resource metadata URL.
- OAuth metadata points to the Supabase Auth issuer.
- Users without an active entitlement cannot spend credits or generate.
- A request ID cannot be charged twice.
- GitHub Pages serves direct `/oauth/consent` navigation through the SPA
  fallback.
- Build and automated tests pass.
