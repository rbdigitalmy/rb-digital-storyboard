import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Retained only so an older deployed route fails closed during migration.
// OAuth 2.1 authorization-code, PKCE, refresh-token rotation, and discovery are
// now owned by Supabase Auth's OAuth Server at /auth/v1/oauth/*.
serve(() => new Response(
  JSON.stringify({
    error: "endpoint_retired",
    error_description: "Use the Supabase Auth OAuth 2.1 server discovery endpoint.",
  }),
  {
    status: 410,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  },
));
