# Deployment

## Architecture

- Frontend: GitHub Pages at `https://rbdigitalmy.github.io/rb-digital-storyboard/`
- Repository: `https://github.com/rbdigitalmy/rb-digital-storyboard`
- Backend, Auth and Postgres: Supabase project `klxzpyzgljvmsepvjhaz`
- MCP: `https://klxzpyzgljvmsepvjhaz.supabase.co/functions/v1/mcp-server`
- OAuth metadata: append `/.well-known/oauth-protected-resource` to the MCP URL

Netlify is not part of the production architecture.

## GitHub Pages

The Vite base is `/rb-digital-storyboard/`. The workflow at
`.github/workflows/deploy-pages.yml` builds `dist`, adds an SPA `404.html`
fallback, and deploys it using GitHub Pages Actions.

The repository must be public on GitHub Free, or the account must have a plan
that supports Pages for private repositories. In Settings → Pages, select
**GitHub Actions** as the source.

## Supabase

The MCP Edge Function is deployed with gateway JWT verification disabled so
OAuth protected-resource discovery can issue a standards-compliant challenge.
The function itself validates every bearer token with Supabase Auth, creates an
RLS-scoped client, and performs entitlement plus atomic credit checks.

Required function settings:

```text
PROJECT_PUBLISHABLE_KEY=<project publishable key>
PUBLIC_BASE_URL=https://rbdigitalmy.github.io/rb-digital-storyboard
```

Deploy MCP:

```text
supabase functions deploy mcp-server --project-ref klxzpyzgljvmsepvjhaz --no-verify-jwt
```

After GitHub Pages is live, configure Supabase Auth OAuth Server:

```text
Site URL: https://rbdigitalmy.github.io/rb-digital-storyboard/
Authorization path: /rb-digital-storyboard/oauth/consent
Redirect URL: https://rbdigitalmy.github.io/rb-digital-storyboard/oauth/consent
```

Never expose a Supabase secret/service-role key in the browser build.
