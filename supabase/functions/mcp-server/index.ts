import { McpServer } from "npm:@modelcontextprotocol/sdk@1.31.0/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "npm:@modelcontextprotocol/sdk@1.31.0/server/webStandardStreamableHttp.js";
import { RESOURCE_MIME_TYPE, registerAppResource, registerAppTool } from "npm:@modelcontextprotocol/ext-apps@1.7.5/server";
import { OpenAIExtensions } from "npm:@openai/mcp-extensions@0.1.0/server";
import type { OpenAIUiResourceMetadata, OpenAIUiToolMetadata } from "npm:@openai/mcp-extensions@0.1.0/server";
import { z } from "npm:zod@4.6.5";
import { generateStoryboard } from "../../../src/lib/storyboardEngine.ts";
import { RB_WORKFLOWS } from "../../../src/lib/storyboardWorkflows.ts";
import { authenticateRequest, oauthChallenge, protectedResourceMetadata } from "../_shared/auth.ts";
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
  if (!auth) return oauthChallenge(request);

  const { user, supabase } = auth;
  const requestOrigin = new URL(request.url).origin;
  const publicOrigin = getEnv("PUBLIC_BASE_URL") || requestOrigin;

  const readSettings = async () => {
    const { data, error } = await supabase
      .from("storyboard_preferences")
      .select("language,aspect_ratio,default_style,default_duration")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw new Error(`Unable to read storyboard settings: ${error.message}`);
    return { ...DEFAULT_SETTINGS, ...(data || {}) };
  };

  const getAccess = async () => {
    const [{ data: entitlement, error: entitlementError }, { data: wallet, error: walletError }] = await Promise.all([
      supabase
        .from("entitlements")
        .select("id,status,plan_id,expires_at")
        .eq("user_id", user.id)
        .eq("product_id", "gpt-storyboard")
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("credit_wallets")
        .select("balance,total_earned,total_spent")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    if (entitlementError) throw new Error(entitlementError.message);
    if (walletError) throw new Error(walletError.message);
    const notExpired = !entitlement?.expires_at || new Date(entitlement.expires_at) > new Date();
    return {
      authenticated_user: user.email || user.id,
      access_granted: Boolean(entitlement && notExpired),
      entitlement: entitlement || null,
      balance: wallet?.balance || 0,
      wallet: wallet || { balance: 0, total_earned: 0, total_spent: 0 },
    };
  };

  const server = new McpServer({ name: "RB Digital Storyboard", version: "1.0.0" });
  const extensions = new OpenAIExtensions(server);

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
      const current = await readSettings();
      const values = { ...current, ...set };
      const { error } = await supabase.from("storyboard_preferences").upsert({ user_id: user.id, ...values, updated_at: new Date().toISOString() });
      if (error) throw new Error(`Unable to save storyboard settings: ${error.message}`);
      return values;
    },
  });

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
    icons: [{ src: `${publicOrigin}/extension/icon.svg`, mimeType: "image/svg+xml", sizes: ["20x20"] }],
    _meta: {
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
    const [access, settings] = await Promise.all([getAccess(), readSettings()]);
    return {
      content: [{ type: "text", text: access.access_granted ? "Storyboard Studio is ready." : "A valid RB Digital purchase is required." }],
      structuredContent: { access, settings, workflows: RB_WORKFLOWS },
    };
  });

  server.registerTool("get_my_access", {
    title: "Check RB Digital access",
    description: "Return the authenticated user's entitlement and credit balance.",
  }, async () => {
    const access = await getAccess();
    return { content: [{ type: "text", text: JSON.stringify(access) }], structuredContent: access };
  });

  server.registerTool("get_my_usage", {
    title: "Get storyboard usage",
    description: "Return recent MCP usage and current credit balance.",
  }, async () => {
    const [{ data: logs, error: logError }, access] = await Promise.all([
      supabase.from("mcp_usage_logs").select("tool_name,status,credits_charged,error_details,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      getAccess(),
    ]);
    if (logError) throw new Error(logError.message);
    const payload = { ...access, recent_usage: logs || [] };
    return { content: [{ type: "text", text: JSON.stringify(payload) }], structuredContent: payload };
  });

  server.registerTool("generate_storyboard", {
    title: "Generate RB Digital storyboard",
    description: "Generate a production-ready storyboard using one of 19 protected RB Digital workflows.",
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
    if (!RB_WORKFLOWS.some((workflow) => workflow.id === args.workflow_id)) {
      return errorToolResult("INVALID_WORKFLOW", "The selected RB Digital workflow does not exist.");
    }

    const requestId = args.request_id || crypto.randomUUID();
    const creditCost = args.duration === "60s" ? 20 : 10;
    const { data: charge, error: chargeError } = await supabase.rpc("consume_storyboard_credits", {
      p_user_id: user.id,
      p_amount: creditCost,
      p_tool_name: "generate_storyboard",
      p_request_id: requestId,
      p_input_summary: args,
    });
    if (chargeError) return errorToolResult("CREDIT_CHECK_FAILED", chargeError.message);
    if (!charge?.success) {
      const code = String(charge?.error || "ACCESS_DENIED");
      const message = code === "INSUFFICIENT_CREDITS"
        ? "Insufficient credits. Top up through the RB Digital portal."
        : "An active RB Digital Storyboard entitlement is required.";
      return errorToolResult(code, message, { portal_url: publicOrigin, ...charge });
    }

    const storyboard = generateStoryboard({
      workflowId: args.workflow_id,
      topic: args.topic,
      productName: args.product_name,
      targetAudience: args.target_audience,
      duration: args.duration,
      language: args.language,
      aspectRatio: args.aspect_ratio,
    });
    const payload = {
      status: "SUCCESS",
      request_id: requestId,
      credits_deducted: charge.credits_charged ?? creditCost,
      remaining_balance: charge.new_balance,
      storyboard,
    };
    return { content: [{ type: "text", text: JSON.stringify(payload) }], structuredContent: payload };
  });

  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: false });
  await server.connect(transport);
  return withCors(await transport.handleRequest(request));
});

