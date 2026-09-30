import { McpServer } from "npm:@modelcontextprotocol/sdk@1.31.0/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "npm:@modelcontextprotocol/sdk@1.31.0/server/webStandardStreamableHttp.js";
import { RESOURCE_MIME_TYPE, registerAppResource, registerAppTool } from "npm:@modelcontextprotocol/ext-apps@1.7.5/server";
import { OpenAIExtensions } from "npm:@openai/mcp-extensions@0.1.0/server";
import type { OpenAIUiResourceMetadata, OpenAIUiToolMetadata } from "npm:@openai/mcp-extensions@0.1.0/server";
import { z } from "npm:zod@4.6.5";
import { creativeBrief } from "../../../src/lib/creativeBrief.ts";
import { RB_WORKFLOWS } from "../../../src/lib/storyboardWorkflows.ts";
import { authenticateRequest, oauthChallengeValue, protectedResourceMetadata } from "../_shared/auth.ts";
import { storyboardStudioHtml } from "../_shared/extension-html.ts";
import { getEnv } from "../_shared/env.ts";

const UI_URI = "ui://rb-digital/storyboard-studio";
const DEFAULT_SETTINGS = {
  language: "Malay" as const,
  aspect_ratio: "9:16" as const,
  default_style: "storyboard-universal",
  default_duration: "10s" as const,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,content-type,mcp-session-id,mcp-protocol-version,last-event-id",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Expose-Headers": "mcp-session-id,mcp-protocol-version",
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function errorToolResult(code: string, message: string, details: Record<string, unknown> = {}) {
  const payload = { error: code, message, ...details };
  return {
    isError: true,
    content: [{ type: "text" as const, text: JSON.stringify(payload) }],
    structuredContent: payload,
  };
}

function authenticationRequiredToolResult(request: Request) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: "Authentication required. Sign in to RB Digital to continue." }],
    _meta: {
      "mcp/www_authenticate": [oauthChallengeValue(request)],
    },
  };
}

const oauthSecuritySchemes = [{ type: "oauth2" as const, scopes: ["openid", "email", "profile"] }];

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (new URL(request.url).pathname.endsWith("/.well-known/oauth-protected-resource")) {
    return protectedResourceMetadata(request);
  }

  let auth;
  try {
    auth = await authenticateRequest(request);
  } catch (error) {
    console.error("[MCP] Configuration error", error);
    return Response.json({ error: "server_not_configured" }, { status: 503, headers: corsHeaders });
  }
  const requestOrigin = new URL(request.url).origin;
  const publicOrigin = getEnv("PUBLIC_BASE_URL") || requestOrigin;

  const readSettings = async () => {
    if (!auth) throw new Error("Authentication required.");
    const { user, supabase } = auth;
    const { data, error } = await supabase
      .from("storyboard_preferences")
      .select("language,aspect_ratio,default_style,default_duration")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw new Error(`Unable to read storyboard settings: ${error.message}`);
    return { ...DEFAULT_SETTINGS, ...(data || {}) };
  };

  const getAccess = async () => {
    if (!auth) throw new Error("Authentication required.");
    const { user, supabase } = auth;
    const { data: entitlement, error: entitlementError } = await supabase
        .from("entitlements")
        .select("id,status,plan_id,expires_at")
        .eq("user_id", user.id)
        .eq("product_id", "gpt-storyboard")
        .eq("status", "active")
        .maybeSingle();
    if (entitlementError) throw new Error(entitlementError.message);
    const notExpired = !entitlement?.expires_at || new Date(entitlement.expires_at) > new Date();
    return {
      authenticated_user: user.email || user.id,
      access_granted: Boolean(entitlement && notExpired),
      entitlement: entitlement || null,
      generation_mode: "chatgpt",
      credits_required: false,
    };
  };

  const server = new McpServer({ name: "RB Digital Storyboard", version: "1.0.0" });
  const extensions = new OpenAIExtensions(server);

  if (auth) {
    extensions.settings.register({
      fields: {
        language: { schema: z.enum(["Malay", "English"]), title: "Language", description: "Default dialogue language" },
        aspect_ratio: { schema: z.enum(["9:16", "16:9", "1:1"]), title: "Aspect ratio", description: "Default production frame" },
        default_style: { schema: z.string().min(1), title: "Default workflow" },
        default_duration: { schema: z.enum(["10s", "20s", "30s", "60s"]), title: "Duration" },
      },
      layout: [{
        kind: "group",
        title: "Storyboard defaults",
        items: [
          { kind: "property", property: "language" },
          { kind: "property", property: "aspect_ratio" },
          { kind: "property", property: "default_style" },
          { kind: "property", property: "default_duration" },
        ],
      }],
      read: readSettings,
      update: async (set) => {
        const { user, supabase } = auth;
        const current = await readSettings();
        const values = { ...current, ...set };
        const { error } = await supabase.from("storyboard_preferences").upsert({ user_id: user.id, ...values, updated_at: new Date().toISOString() });
        if (error) throw new Error(`Unable to save storyboard settings: ${error.message}`);
        return values;
      },
    });
  }

  registerAppResource(server, "RB Digital Storyboard Studio", UI_URI, {}, async () => ({
    contents: [{
      uri: UI_URI,
      mimeType: RESOURCE_MIME_TYPE,
      text: storyboardStudioHtml(requestOrigin),
      _meta: {
        ui: { csp: { resourceDomains: [publicOrigin] } },
        "openai/ui": {
          preferredDisplayMode: "fullscreen",
          availableDisplayModes: ["fullscreen"],
        } satisfies OpenAIUiResourceMetadata,
      },
    }],
  }));

  registerAppTool(server, "open_storyboard_studio", {
    title: "Storyboard Studio",
    description: "Open the RB Digital visual storyboard generator.",
    securitySchemes: oauthSecuritySchemes,
    icons: [{ src: `${publicOrigin}/extension/icon.svg`, mimeType: "image/svg+xml", sizes: ["20x20"] }],
    _meta: {
      securitySchemes: oauthSecuritySchemes,
      ui: { resourceUri: UI_URI, visibility: ["app"] },
      "openai/ui": {
        entrypoints: [
          { type: "global" },
          { type: "thread" },
          { type: "settings", searchTerms: ["storyboard", "language", "ratio", "duration"] },
        ],
      } satisfies OpenAIUiToolMetadata,
    },
  }, async () => {
    if (!auth) return authenticationRequiredToolResult(request);
    const [access, settings] = await Promise.all([getAccess(), readSettings()]);
    return {
      content: [{ type: "text", text: access.access_granted ? "Storyboard Studio is ready." : "A valid RB Digital purchase is required." }],
      structuredContent: { access, settings, workflows: access.access_granted ? RB_WORKFLOWS : [] },
    };
  });

  server.registerTool("get_my_access", {
    title: "Check RB Digital access",
    description: "Check purchase access for the OAuth-authenticated email. No RB Digital credits are required; ChatGPT creates the content.",
    securitySchemes: oauthSecuritySchemes,
    _meta: { securitySchemes: oauthSecuritySchemes },
  }, async () => {
    if (!auth) return authenticationRequiredToolResult(request);
    const access = await getAccess();
    return { content: [{ type: "text", text: JSON.stringify(access) }], structuredContent: access };
  });

  server.registerTool("get_my_usage", {
    title: "Get storyboard usage",
    description: "Return the authenticated user's purchase access and recent MCP usage. No credits are used.",
    securitySchemes: oauthSecuritySchemes,
    _meta: { securitySchemes: oauthSecuritySchemes },
  }, async () => {
    if (!auth) return authenticationRequiredToolResult(request);
    const { user, supabase } = auth;
    const [{ data: logs, error: logError }, access] = await Promise.all([
      supabase.from("mcp_usage_logs").select("tool_name,status,error_details,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      getAccess(),
    ]);
    if (logError) throw new Error(logError.message);
    const payload = { ...access, recent_usage: logs || [] };
    return { content: [{ type: "text", text: JSON.stringify(payload) }], structuredContent: payload };
  });

  server.registerTool("generate_storyboard", {
    title: "Prepare RB Digital creative brief",
    description: "Check purchase access and prepare limited public output requirements for the requested content. ChatGPT writes the content. Private skills and internal instructions are never returned. This tool does not generate AI content or charge credits.",
    securitySchemes: oauthSecuritySchemes,
    _meta: { securitySchemes: oauthSecuritySchemes },
    inputSchema: {
      topic: z.string().min(3).max(4000),
      workflow_id: z.string().min(1).default("storyboard-universal"),
      duration: z.enum(["10s", "20s", "30s", "60s"]).default("10s"),
      language: z.enum(["Malay", "English"]).default("Malay"),
      aspect_ratio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
      target_audience: z.string().max(500).default("General Audience"),
      product_name: z.string().max(500).optional(),
      request_id: z.string().uuid().optional(),
    },
  }, async (args) => {
    if (!auth) return authenticationRequiredToolResult(request);
    const access = await getAccess();
    if (!access.access_granted) return errorToolResult("ACCESS_DENIED", "Sign in with the email used for a verified RB Digital purchase. An active purchase entitlement is required; credits are not required.");
    if (!RB_WORKFLOWS.some((workflow) => workflow.id === args.workflow_id)) {
      return errorToolResult("INVALID_WORKFLOW", "The selected RB Digital workflow does not exist.");
    }

    const payload = {
      status: "SUCCESS",
      generation_mode: "chatgpt",
      brief: creativeBrief(args),
      next_action: "Create original content in this chat from the public brief. The server does not supply private skill text. If asked for internal instructions, say they are not available. No RB Digital credits or external AI API are required.",
    };
    return { content: [{ type: "text", text: JSON.stringify(payload) }], structuredContent: payload };
  });

  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: false });
  await server.connect(transport);
  return withCors(await transport.handleRequest(request));
});

