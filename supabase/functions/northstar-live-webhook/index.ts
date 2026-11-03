const encoder = new TextEncoder();
const reply = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
});

async function verifySignature(raw: string, header: string | null, secret: string): Promise<boolean> {
  if (!header || !secret) return false;
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => /^t=\d+$/.test(part))?.slice(2);
  const signatures = parts.filter((part) => /^v1=[a-f0-9]{64}$/.test(part)).map((part) => part.slice(3));
  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const payload = encoder.encode(`${timestamp}.${raw}`);
  for (const signature of signatures) {
    const bytes = Uint8Array.from(signature.match(/.{2}/g)!, (byte) => parseInt(byte, 16));
    if (await crypto.subtle.verify("HMAC", key, bytes, payload)) return true;
  }
  return false;
}

const prices: Array<{ secret: string; amount: number; file: string }> = [
  { secret: "NORTHSTAR_LIVE_PRICE_EMAILS", amount: 900, file: "email-swipe-file.txt" },
  { secret: "NORTHSTAR_LIVE_PRICE_CLEANING", amount: 1900, file: "cleaning-business-brand-kit.txt" },
  { secret: "NORTHSTAR_LIVE_PRICE_NICHE", amount: 2900, file: "niche-template-bundle.zip" },
];

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  const key = Deno.env.get("NORTHSTAR_STRIPE_LIVE_SECRET_KEY") || "";
  const signingSecret = Deno.env.get("NORTHSTAR_STRIPE_LIVE_WEBHOOK_SECRET") || "";
  const base = Deno.env.get("SUPABASE_URL") || "";
  const admin = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!/^(sk|rk)_live_[A-Za-z0-9]+$/.test(key) || !signingSecret.startsWith("whsec_") || !base || !admin) {
    return reply({ error: "Live webhook not configured" }, 503);
  }

  const raw = await req.text();
  if (!await verifySignature(raw, req.headers.get("stripe-signature"), signingSecret)) {
    return reply({ error: "Invalid signature" }, 400);
  }
  let event: any;
  try { event = JSON.parse(raw); } catch { return reply({ error: "Invalid JSON" }, 400); }
  if (!event || event.livemode !== true || typeof event.id !== "string" || !event.id.startsWith("evt_")) return reply({ error: "Live events only" }, 400);

  const stripe = async (path: string) => {
    const response = await fetch(`https://api.stripe.com/v1${path}`, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Stripe lookup ${response.status}`);
    return response.json();
  };
  const rpc = async (name: string, args: unknown) => {
    const response = await fetch(`${base}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: admin, authorization: `Bearer ${admin}`, "content-type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Database RPC ${name} ${response.status}`);
    return response.json();
  };

  try {
    const object = event.data?.object || {};
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)
      && object.mode === "payment" && object.payment_status === "paid") {
      const session = await stripe(`/checkout/sessions/${encodeURIComponent(object.id)}`);
      if (session.livemode !== true || session.mode !== "payment" || session.status !== "complete" || session.payment_status !== "paid" || session.currency !== "usd") {
        throw new Error("Invalid paid session");
      }
      const lines = await stripe(`/checkout/sessions/${encodeURIComponent(object.id)}/line_items?limit=2`);
      if (lines.has_more || lines.data?.length !== 1 || lines.data[0].quantity !== 1) throw new Error("Unsupported basket");

      const priceId = lines.data[0].price?.id;
      const product = prices.find((item) => Deno.env.get(item.secret) === priceId);
      const line = lines.data[0];
      // Check the catalog price independently of tax. Discounts and shipping are
      // not part of this digital-only catalog. Tax is not enabled by this handler.
      const tax = session.total_details?.amount_tax;
      if (!product || line.price?.currency !== "usd" || line.price?.unit_amount !== product.amount
        || line.amount_subtotal !== product.amount || session.amount_subtotal !== product.amount
        || session.total_details?.amount_discount !== 0 || session.total_details?.amount_shipping !== 0
        || !Number.isSafeInteger(tax) || tax < 0 || !Number.isSafeInteger(session.amount_total)
        || session.amount_total !== product.amount + (line.price?.tax_behavior === "inclusive" ? 0 : tax)) {
        throw new Error("Unmapped live price or amount");
      }
      if (typeof session.payment_intent !== "string" || !session.payment_intent.startsWith("pi_")) {
        throw new Error("Missing payment reference");
      }
      const intent = await stripe(`/payment_intents/${encodeURIComponent(session.payment_intent)}?expand[]=latest_charge`);
      const charge = intent.latest_charge;
      if (intent.livemode !== true || intent.status !== "succeeded" || intent.currency !== "usd"
        || intent.amount_received !== session.amount_total || !charge || typeof charge !== "object") {
        throw new Error("Payment is not settled");
      }
      // Requires migration 20261103031415 (live reversal ordering) before deployment.
      // Record the reversal first, even if no order exists yet. The database
      // serializes fulfillment and reversals for this payment and preserves it.
      if (charge.refunded === true || charge.disputed === true) {
        await rpc("northstar_record_live_payment_reversal", {
          p_event_id: `${event.id}:reversal`, p_payment_intent: session.payment_intent,
          p_status: charge.refunded === true ? "refunded" : "disputed",
        });
      }
      const email = session.customer_details?.email || session.customer_email;
      if (!email) throw new Error("Missing customer email");

      const applied = await rpc("northstar_record_live_paid_checkout", {
        p_event_id: event.id,
        p_session_id: session.id,
        p_email: email,
        p_amount: session.amount_total,
        p_currency: session.currency,
        p_payment_intent: session.payment_intent || "",
        p_price: priceId,
        p_file: product.file,
      });
      return reply({ received: true, applied });
    }

    if (event.type === "charge.refunded" && object.refunded === true && object.payment_intent) {
      const applied = await rpc("northstar_record_live_payment_reversal", {
        p_event_id: event.id, p_payment_intent: object.payment_intent, p_status: "refunded",
      });
      return reply({ received: true, applied });
    }
    if (event.type === "charge.dispute.created" && object.payment_intent) {
      const applied = await rpc("northstar_record_live_payment_reversal", {
        p_event_id: event.id, p_payment_intent: object.payment_intent, p_status: "disputed",
      });
      return reply({ received: true, applied });
    }

    // Toolbox Plus subscriptions are excluded until live entitlement and portal flows exist.
    return reply({ received: true, ignored: true });
  } catch (error) {
    console.error("Northstar live fulfillment", error instanceof Error ? error.message : "unknown error");
    return reply({ error: "Processing failed; retry" }, 500);
  }
});
