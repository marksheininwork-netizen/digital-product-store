// Maria-only Stripe test webhook. Draft: do not deploy until Maria's webhook signing secret is configured.
const enc = new TextEncoder();
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json", "cache-control": "no-store" },
});
const catalog: Record<string, { amount: number; file: string }> = {
  price_1UZagOPKQ5OP9J0xXQ7hmn4s: { amount: 900, file: "email-swipe-file.txt" },
  price_1UZagQPKQ5OP9J0xxiZTjTVw: { amount: 1900, file: "cleaning-business-brand-kit.txt" },
  price_1UZagRPKQ5OP9J0xv5wjMrak: { amount: 2900, file: "niche-template-bundle.zip" },
};
async function verify(raw: string, header: string, secret: string) {
  const parts = header.split(",").map(x => x.trim());
  const timestamp = parts.find(x => /^t=\d+$/.test(x))?.slice(2);
  const signatures = parts.filter(x => /^v1=[a-f0-9]{64}$/.test(x)).map(x => x.slice(3));
  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(timestamp + "." + raw)));
    return signatures.some(x => {\n    const bytes = new Uint8Array(x.match(/../g)!.map(h => parseInt(h, 16)));\n    let diff = 0;\n    for (let i = 0; i < digest.length; i++) diff |= bytes[i] ^ digest[i];\n    return diff === 0;\n  });
}
Deno.serve(async req => {
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);
  const signingSecret = Deno.env.get("NORTHSTAR_MARIA_TEST_WEBHOOK_SECRET") || "";
  const stripeKey = Deno.env.get("NORTHSTAR_MARIA_TEST_STRIPE_SECRET_KEY") || "";
  const base = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!signingSecret.startsWith("whsec_") || !stripeKey.startsWith("sk_test_") || !base || !serviceKey) {
    return response({ error: "Maria sandbox not configured" }, 503);
  }
  const raw = await req.text();
  if (!await verify(raw, req.headers.get("stripe-signature") || "", signingSecret)) {
    return response({ error: "Invalid signature" }, 400);
  }
  let event: any;
  try { event = JSON.parse(raw); } catch { return response({ error: "Invalid JSON" }, 400); }
  if (typeof event.id !== "string" || !event.id.startsWith("evt_") || event.livemode !== false) return response({ error: "Test events only" }, 400);
  const obj = event.data?.object || {};
  const stripe = async (path: string) => {
    const result = await fetch("https://api.stripe.com/v1" + path, { headers: { authorization: "Bearer " + stripeKey } });
    if (!result.ok) throw new Error("Stripe lookup failed " + result.status);
    return result.json();
  };
  const rpc = async (name: string, payload: Record<string, unknown>) => {
    const result = await fetch(base + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: { apikey: serviceKey, authorization: "Bearer " + serviceKey, "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!result.ok) throw new Error("RPC failed " + result.status);
    return result.json();
  };
  try {
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      if (obj.mode !== "payment" || obj.payment_status !== "paid") return response({ received: true, ignored: true });
      const session = await stripe("/checkout/sessions/" + encodeURIComponent(obj.id));
      if (session.livemode !== false || session.mode !== "payment" || session.payment_status !== "paid" ||
          session.client_reference_id !== "northstar-maria-test" || !session.payment_intent) throw Error("Invalid test session");
      const lines = await stripe("/checkout/sessions/" + encodeURIComponent(session.id) + "/line_items?limit=2");
      if (lines.has_more || lines.data?.length !== 1 || lines.data[0].quantity !== 1) throw Error("Unexpected basket");
      const item = catalog[lines.data[0].price?.id];
      if (!item || lines.data[0].price?.unit_amount !== item.amount ||
          session.currency !== "usd" || session.amount_subtotal !== item.amount ||
          session.amount_total !== item.amount) throw Error("Unexpected product or amount");
      const email = session.customer_details?.email || session.customer_email;
      if (!email) throw Error("Missing buyer email");
      const applied = await rpc("northstar_record_paid_checkout", {
        p_event_id: event.id, p_session_id: session.id, p_email: email,
        p_amount: session.amount_total, p_currency: session.currency,
        p_payment_intent: session.payment_intent, p_price: lines.data[0].price.id, p_file: item.file,
      });
      return response({ received: true, applied });
    }
    if (event.type === "charge.refunded" && obj.refunded === true && obj.payment_intent) {
      const charge = await stripe("/charges/" + encodeURIComponent(obj.id));
      if (charge.livemode !== false || charge.payment_intent !== obj.payment_intent || charge.refunded !== true) throw Error("Invalid charge");
      return response({ received: true, applied: await rpc("northstar_record_payment_reversal", {
        p_event_id: event.id, p_payment_intent: obj.payment_intent, p_status: "refunded",
      }) });
    }
    if (event.type === "charge.dispute.created" && obj.charge) {
      const charge = await stripe("/charges/" + encodeURIComponent(obj.charge));
      if (charge.livemode !== false || !charge.payment_intent || charge.disputed !== true || obj.id !== charge.dispute) throw Error("Invalid dispute");
      return response({ received: true, applied: await rpc("northstar_record_payment_reversal", {
        p_event_id: event.id, p_payment_intent: charge.payment_intent, p_status: "disputed",
      }) });
    }
    return response({ received: true, ignored: true });
  } catch (error) {
    console.error("Maria sandbox webhook", String(error));
    return response({ error: "Processing failed; retry" }, 500);
  }
});
