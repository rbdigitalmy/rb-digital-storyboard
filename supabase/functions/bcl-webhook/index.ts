import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const BCL_WEBHOOK_SECRET = Deno.env.get("BCL_WEBHOOK_SECRET") || "";
const BCL_API_KEY = Deno.env.get("BCL_API_KEY") || "";
const BCL_API_BASE_URL = Deno.env.get("BCL_API_BASE_URL") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface BclWebhookPayload {
  event_type: string; // e.g. 'payment.success', 'payment.refunded'
  order_id: string;
  form_id: string;
  customer_email: string;
  customer_name?: string;
  product_id?: string;
  plan_id?: string;
  amount: number;
  currency: string;
  payment_status: string; // 'PAID', 'FAILED', 'REFUNDED'
  metadata?: Record<string, unknown>;
}

serve(async (req: Request) => {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bcl-secret",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !BCL_WEBHOOK_SECRET || !BCL_API_KEY || !BCL_API_BASE_URL) {
      console.error("[BCL Webhook] Required server secrets are not configured");
      return new Response(
        JSON.stringify({ error: "SERVER_NOT_CONFIGURED" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const secretQuery = url.searchParams.get("secret");
    const secretHeader = req.headers.get("x-bcl-secret");

    // Defense in Depth 1: High-entropy secret validation
    if (secretQuery !== BCL_WEBHOOK_SECRET && secretHeader !== BCL_WEBHOOK_SECRET) {
      console.error("[BCL Webhook] Security Alert: Invalid webhook secret token");
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED_WEBHOOK_SECRET" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: BclWebhookPayload = await req.json();
    const {
      event_type = "payment.success",
      order_id,
      form_id,
      customer_email,
      customer_name = "Customer",
      amount,
      currency = "MYR",
      payment_status,
      product_id = "gpt-storyboard",
      plan_id = "gpt-storyboard-lifetime",
    } = payload;

    if (!order_id || !customer_email) {
      return new Response(
        JSON.stringify({ error: "MISSING_REQUIRED_FIELDS", message: "order_id and customer_email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const idempotencyKey = `bcl:${order_id}:${event_type}`;

    // Defense in Depth 2: Idempotency check via webhook_events
    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id, status")
      .eq("idempotency_key", idempotencyKey)
      .single();

    if (existingEvent && existingEvent.status === "processed") {
      console.log(`[BCL Webhook] Event ${idempotencyKey} already processed. Skipping.`);
      return new Response(
        JSON.stringify({ success: true, message: "EVENT_ALREADY_PROCESSED" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store webhook event initial state
    await supabase.from("webhook_events").upsert(
      {
        provider: "bcl",
        idempotency_key: idempotencyKey,
        event_type,
        payload,
        status: "received",
      },
      { onConflict: "idempotency_key" }
    );

    // Defense in Depth 3: Authenticated API Reconciliation against BCL Source of Truth
    let isReconciled = false;
    let reconciledData: Record<string, unknown> = {};

    try {
      const reconResponse = await fetch(`${BCL_API_BASE_URL}/transactions/${order_id}`, {
        headers: {
          Authorization: `Bearer ${BCL_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (reconResponse.ok) {
        reconciledData = await reconResponse.json();
        const reconStatus = String(reconciledData.status || reconciledData.payment_status || "").toUpperCase();
        const reconEmail = String(reconciledData.customer_email || reconciledData.email || "").toLowerCase().trim();
        const reconAmount = Number(reconciledData.amount);
        const paid = reconStatus === "PAID" || reconStatus === "SUCCESS";
        const emailMatches = reconEmail === customer_email.toLowerCase().trim();
        const amountMatches = Number.isFinite(reconAmount) && Math.abs(reconAmount - Number(amount)) < 0.01;
        isReconciled = paid && emailMatches && amountMatches;
      } else {
        console.error(`[BCL Webhook] Reconciliation API returned ${reconResponse.status}`);
      }
    } catch (err) {
      console.error("[BCL Webhook] Reconciliation request failed:", err);
    }

    if (!isReconciled) {
      console.error(`[BCL Webhook] Payment reconciliation failed for order ${order_id}`);
      await supabase
        .from("webhook_events")
        .update({ status: "failed", error_message: "RECONCILIATION_FAILED" })
        .eq("idempotency_key", idempotencyKey);

      return new Response(
        JSON.stringify({ error: "PAYMENT_RECONCILIATION_FAILED" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Resolve or Create Customer User Profile
    let userId: string;
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", customer_email.toLowerCase().trim())
      .single();

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      // Create user account in auth.users via admin API
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: customer_email.toLowerCase().trim(),
        email_confirm: true,
        user_metadata: { full_name: customer_name, role: "customer" },
      });

      if (createUserError || !newUser.user) {
        console.error("[BCL Webhook] User creation error:", createUserError);
        throw new Error(`Failed to create account for ${customer_email}`);
      }
      userId = newUser.user.id;
    }

    // Step 5: Upsert Purchase Record
    const { data: purchaseRecord, error: purchaseError } = await supabase
      .from("purchases")
      .upsert(
        {
          user_id: userId,
          provider: "bcl",
          provider_order_id: order_id,
          provider_customer_id: form_id,
          product_id,
          plan_id,
          amount,
          currency,
          verified_payment_status: "verified",
          verified_at: new Date().toISOString(),
          metadata: { form_id, customer_name, event_type, reconciled: isReconciled },
        },
        { onConflict: "provider,provider_order_id" }
      )
      .select()
      .single();

    if (purchaseError) {
      console.error("[BCL Webhook] Purchase insertion error:", purchaseError);
      throw purchaseError;
    }

    // Step 6: Atomic Entitlement Grant & Credit Allocation
    const { data: grantResult, error: grantError } = await supabase.rpc("grant_entitlement_atomic", {
      p_user_id: userId,
      p_product_id: product_id,
      p_plan_id: plan_id,
      p_source_purchase_id: purchaseRecord.id,
      p_granted_by: "bcl_webhook",
    });

    if (grantError) {
      console.error("[BCL Webhook] Grant entitlement error:", grantError);
      throw grantError;
    }

    // Step 7: Update Webhook Event Status
    await supabase
      .from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey);

    // Step 8: Trigger Email Notification (Asynchronous, non-blocking)
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "purchase_verified",
          recipient_email: customer_email,
          customer_name,
          product_name: "RB Digital Storyboard Suite",
          order_id,
          plan_name: plan_id,
        }),
      });
    } catch (emailErr) {
      console.warn("[BCL Webhook] Email notification trigger warning:", emailErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "PAYMENT_VERIFIED_AND_ACCESS_GRANTED",
        purchase_id: purchaseRecord.id,
        grant_result: grantResult,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("[BCL Webhook] Internal Error:", errMessage);
    return new Response(
      JSON.stringify({ error: "INTERNAL_SERVER_ERROR", details: errMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
