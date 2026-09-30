import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const BCL_API_KEY = Deno.env.get("BCL_API_KEY") || "";
const BCL_API_BASE_URL = Deno.env.get("BCL_API_BASE_URL") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !BCL_API_KEY || !BCL_API_BASE_URL) {
      return new Response(JSON.stringify({ error: "SERVER_NOT_CONFIGURED" }), { status: 503, headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers: corsHeaders });
    }

    // Verify calling user JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "INVALID_USER_TOKEN" }), { status: 401, headers: corsHeaders });
    }

    const { action, order_id, purchase_email, verification_code } = await req.json();

    if (action === "initiate") {
      if (!order_id || !purchase_email) {
        return new Response(
          JSON.stringify({ error: "MISSING_PARAMETERS", message: "order_id and purchase_email required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const cleanEmail = purchase_email.toLowerCase().trim();
      const userEmail = user.email?.toLowerCase().trim() || "";

      // 1. Query BCL API / database for historical transaction
      let bclVerified = false;
      let verifiedAmount = 0;
      try {
        const res = await fetch(`${BCL_API_BASE_URL}/transactions/${order_id}`, {
          headers: { Authorization: `Bearer ${BCL_API_KEY}` }
        });
        if (res.ok) {
          const bclTx = await res.json();
          const status = String(bclTx.status || bclTx.payment_status || "").toUpperCase();
          const sourceEmail = String(bclTx.customer_email || bclTx.email || "").toLowerCase().trim();
          verifiedAmount = Number(bclTx.amount);
          bclVerified = (status === "PAID" || status === "SUCCESS") && sourceEmail === cleanEmail;
        }
      } catch (error) {
        console.error("[Customer Claim] BCL reconciliation failed", error);
      }

      if (!bclVerified) {
        return new Response(
          JSON.stringify({ error: "HISTORICAL_ORDER_NOT_FOUND", message: "No paid BCL transaction found matching order ID" }),
          { status: 404, headers: corsHeaders }
        );
      }

      // Case A: Email matches logged-in user email -> Instant grant!
      if (cleanEmail === userEmail) {
        // Upsert purchase
        const { data: purchaseRecord } = await supabase
          .from("purchases")
          .upsert({
            user_id: user.id,
            provider: "bcl",
            provider_order_id: order_id,
            product_id: "gpt-storyboard",
            plan_id: "gpt-storyboard-lifetime",
            amount: verifiedAmount,
            currency: "MYR",
            verified_payment_status: "verified",
            verified_at: new Date().toISOString(),
            metadata: { claimed_by: user.id, direct_match: true }
          }, { onConflict: "provider,provider_order_id" })
          .select()
          .single();

        // Grant entitlement
        await supabase.rpc("grant_entitlement_atomic", {
          p_user_id: user.id,
          p_product_id: "gpt-storyboard",
          p_plan_id: "gpt-storyboard-lifetime",
          p_source_purchase_id: purchaseRecord?.id,
          p_granted_by: "direct_email_claim"
        });

        return new Response(
          JSON.stringify({
            success: true,
            status: "CLAIMED_INSTANTLY",
            message: "Historical purchase verified and entitlement activated!"
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // Case B: Cross-email claim -> Generate 6-digit code and require email verification
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = await sha256(code);

      await supabase.from("customer_claims").insert({
        user_id: user.id,
        purchase_email: cleanEmail,
        order_id,
        claim_status: "pending",
        verification_code: null,
        verification_code_hash: codeHash,
        verification_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        verified_amount: verifiedAmount
      });

      // Send verification code to original purchase email
      await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "claim_code",
          recipient_email: cleanEmail,
          verification_code: code,
          order_id
        })
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: "VERIFICATION_CODE_SENT",
          message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit code to complete claim.`
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (action === "verify_code") {
      const { data: claimRecord } = await supabase
        .from("customer_claims")
        .select("*")
        .eq("user_id", user.id)
        .eq("order_id", order_id)
        .eq("claim_status", "pending")
        .single();

      const suppliedHash = await sha256(String(verification_code || ""));
      const expired = !claimRecord?.verification_expires_at || new Date(claimRecord.verification_expires_at) <= new Date();
      const tooManyAttempts = (claimRecord?.verification_attempts || 0) >= 5;
      const invalidCode = !claimRecord || claimRecord.verification_code_hash !== suppliedHash;

      if (claimRecord && invalidCode && !tooManyAttempts) {
        await supabase.from("customer_claims")
          .update({ verification_attempts: (claimRecord.verification_attempts || 0) + 1 })
          .eq("id", claimRecord.id);
      }

      if (invalidCode || expired || tooManyAttempts) {
        return new Response(
          JSON.stringify({ error: "INVALID_VERIFICATION_CODE", message: "Verification code incorrect, expired, or locked" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Update claim record
      await supabase.from("customer_claims")
        .update({ claim_status: "verified", verified_at: new Date().toISOString() })
        .eq("id", claimRecord.id);

      // Create purchase and grant entitlement
      const { data: purchaseRecord } = await supabase
        .from("purchases")
        .upsert({
          user_id: user.id,
          provider: "bcl",
          provider_order_id: order_id,
          product_id: "gpt-storyboard",
          plan_id: "gpt-storyboard-lifetime",
          amount: Number(claimRecord.verified_amount || 0),
          currency: "MYR",
          verified_payment_status: "verified",
          verified_at: new Date().toISOString(),
          metadata: { claimed_by: user.id, code_verified: true }
        }, { onConflict: "provider,provider_order_id" })
        .select()
        .single();

      await supabase.rpc("grant_entitlement_atomic", {
        p_user_id: user.id,
        p_product_id: "gpt-storyboard",
        p_plan_id: "gpt-storyboard-lifetime",
        p_source_purchase_id: purchaseRecord?.id,
        p_granted_by: "email_code_claim"
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: "CLAIMED_SUCCESSFULLY",
          message: "Purchase verified! Entitlement activated for your account."
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ error: "INVALID_ACTION" }), { status: 400, headers: corsHeaders });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "CLAIM_FAILED", details: msg }), { status: 500, headers: corsHeaders });
  }
});
