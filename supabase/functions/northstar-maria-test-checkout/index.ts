// Isolated Maria test-mode checkout. Not deployed; requires dedicated Maria secrets.
// No live Stripe credentials are accepted by this function.
const site = "https://northstar.atlaspointdigital.com";
const catalog: Record<string, { price: string; amount: number }> = {
  emails: { price: "price_1UZagOPKQ5OP9J0xXQ7hmn4s", amount: 900 },
  cleaning: { price: "price_1UZagQPKQ5OP9J0xxiZTjTVw", amount: 1900 },
  niche: { price: "price_1UZagRPKQ5OP9J0xv5wjMrak", amount: 2900 },
};
const headers = {
  "content-type": "application/json",
  "cache-control": "no-store",
  "access-control-allow-origin": site,
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization,apikey",
  vary: "Origin",
};
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  if (req.headers.get("origin") !== site) return reply({ error: "Origin not allowed" }, 403);
  const key = Deno.env.get("NORTHSTAR_MARIA_TEST_STRIPE_SECRET_KEY") || "";
  if (!/^sk_test_[A-Za-z0-9]+$/.test(key)) return reply({ error: "Maria sandbox not configured" }, 503);
  let sku: unknown;
  try { sku = (await req.json()).sku; } catch { return reply({ error: "Invalid request" }, 400); }
  if (typeof sku !== "string" || !Object.prototype.hasOwnProperty.call(catalog, sku)) return reply({ error: "Unknown product" }, 400);
  const params = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": catalog[sku].price,
    "line_items[0][quantity]": "1",
    "shipping_address_collection[allowed_countries][0]": "US",
    "billing_address_collection": "required",
    success_url: `${site}/account.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/stripe-test-store.html?checkout=cancel`,
    client_reference_id: "northstar-maria-test",
    "metadata[sku]": sku,
  });
  // Automatic tax is intentionally omitted while Maria's Stripe Tax settings are pending.
  // Never use this test-only function as a production checkout.
  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded" },
      body: params,
      signal: AbortSignal.timeout(15000),
    });
    const session = await response.json();
    if (!response.ok || session.livemode !== false || session.mode !== "payment" || session.client_reference_id !== "northstar-maria-test" || typeof session.url !== "string") return reply({ error: "Test checkout unavailable" }, 502);
    const url = new URL(session.url);
    if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") return reply({ error: "Unexpected checkout URL" }, 502);
    return reply({ url: url.href, test_mode: true });
  } catch {
    return reply({ error: "Test checkout unavailable" }, 503);
  }
});
