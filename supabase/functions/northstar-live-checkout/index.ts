// Live checkout is deliberately fail-closed. Keep the flag unset until the
// owner completes merchant, tax, refund, support, and production webhook setup.
const site = "https://northstar.atlaspointdigital.com";
// Change only after explicit launch approval and completion of the checklist.
const LIVE_SALES_RELEASED = false;
const cors = {
  "access-control-allow-origin": site,
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization,apikey",
  "vary": "Origin",
};
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...cors, "content-type": "application/json", "cache-control": "no-store" },
});

const catalog: Record<string, { priceSecret: string; amount: number; file: string }> = {
  emails: { priceSecret: "NORTHSTAR_LIVE_PRICE_EMAILS", amount: 900, file: "email-swipe-file.txt" },
  cleaning: { priceSecret: "NORTHSTAR_LIVE_PRICE_CLEANING", amount: 1900, file: "cleaning-business-brand-kit.txt" },
  niche: { priceSecret: "NORTHSTAR_LIVE_PRICE_NICHE", amount: 2900, file: "niche-template-bundle.zip" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  if (req.headers.get("origin") !== site) return reply({ error: "Origin not allowed" }, 403);

  if (!LIVE_SALES_RELEASED || Deno.env.get("NORTHSTAR_LIVE_CHECKOUT_ENABLED") !== "true") {
    return reply({ error: "Purchases are not yet available. Secure delivery is being finalized." }, 503);
  }

  const key = Deno.env.get("NORTHSTAR_STRIPE_LIVE_SECRET_KEY") || "";
  if (!key.startsWith("sk_live_")) return reply({ error: "Live payments are not configured" }, 503);

  let sku: unknown;
  try { sku = (await req.json()).sku; } catch { return reply({ error: "Invalid request" }, 400); }
  if (typeof sku !== "string" || !Object.hasOwn(catalog, sku)) return reply({ error: "Unknown product" }, 400);

  const item = catalog[sku];
  const price = Deno.env.get(item.priceSecret) || "";
  if (!/^price_[A-Za-z0-9]+$/.test(price)) return reply({ error: "Product is not configured" }, 503);

  const params = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    success_url: `${site}/account.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/shop.html?checkout=cancel`,
    client_reference_id: "northstar-web",
    "metadata[sku]": sku,
  });

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = await response.json();
    if (!response.ok || !data.url || data.livemode !== true) return reply({ error: "Checkout unavailable" }, 502);
    return reply({ url: data.url });
  } catch {
    return reply({ error: "Checkout unavailable" }, 503);
  }
});
