import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2.117.2";
import { getEnv, requireEnv } from "./env.ts";

export interface AuthenticatedRequest {
  user: User;
  supabase: SupabaseClient;
  token: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,content-type,mcp-session-id,mcp-protocol-version,last-event-id",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Expose-Headers": "mcp-session-id,mcp-protocol-version,www-authenticate",
};

function functionUrl(_request: Request): string {
  return `${requireEnv("SUPABASE_URL").replace(/\/$/, "")}/functions/v1/mcp-server`;
}

export async function authenticateRequest(request: Request): Promise<AuthenticatedRequest | null> {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  const supabase = createClient(
    requireEnv("SUPABASE_URL"),
    getEnv("PROJECT_PUBLISHABLE_KEY") || requireEnv("SUPABASE_ANON_KEY"),
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user, supabase, token };
}

export function oauthChallenge(request: Request): Response {
  const challenge = oauthChallengeValue(request);
  return Response.json(
    { error: "unauthorized", error_description: "A valid Supabase OAuth access token is required." },
    {
      status: 401,
      headers: {
        ...corsHeaders,
        "WWW-Authenticate": challenge,
        "Cache-Control": "no-store",
      },
    },
  );
}

export function oauthChallengeValue(request: Request): string {
  const resource = functionUrl(request);
  return `Bearer resource_metadata="${resource}/.well-known/oauth-protected-resource", error="invalid_token", error_description="Sign in to RB Digital to continue"`;
}

export function protectedResourceMetadata(request: Request): Response {
  return Response.json({
    resource: functionUrl(request),
    authorization_servers: [`${requireEnv("SUPABASE_URL").replace(/\/$/, "")}/auth/v1`],
    scopes_supported: ["openid", "email", "profile"],
    bearer_methods_supported: ["header"],
  }, {
    headers: { ...corsHeaders, "Cache-Control": "public, max-age=300" },
  });
}
