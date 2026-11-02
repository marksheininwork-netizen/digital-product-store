const origin = "https://northstar.atlaspointdigital.com";
const cors = {
  "access-control-allow-origin": origin,
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization,apikey,content-type",
  "vary": "Origin",
  "cache-control": "no-store",
};
const respond = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...cors, "content-type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "GET") return respond({ error: "Method not allowed" }, 405);
  const url = new URL(req.url);
  if (url.pathname.endsWith("/health")) {
    return respond({ status: "ok", mode: "live_and_test_separated", access: "verified_email", bucket: "private" });
  }
  if (req.headers.get("origin") && req.headers.get("origin") !== origin) return respond({ error: "Origin not allowed" }, 403);

  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return respond({ error: "Sign in required" }, 401);
  const base = Deno.env.get("SUPABASE_URL");
  const admin = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publishable = Deno.env.get("SUPABASE_ANON_KEY");
  if (!base || !admin || !publishable) return respond({ error: "Server not configured" }, 503);

  try {
    const identity = await fetch(`${base}/auth/v1/user`, {
      headers: { authorization: `Bearer ${token}`, apikey: publishable },
    });
    if (!identity.ok) return respond({ error: "Invalid session" }, 401);
    const user = await identity.json();
    if (!user.id || !user.email || !user.email_confirmed_at) return respond({ error: "Verified email required" }, 403);

    const email = String(user.email).trim().toLowerCase();
    const headers = { apikey: admin, authorization: `Bearer ${admin}` };
    const query = new URL(`${base}/rest/v1/northstar_orders`);
    query.searchParams.set("select", "id,stripe_checkout_session_id,created_at,amount_total,currency,livemode,northstar_order_items(stripe_price_id,storage_object_path)");
    query.searchParams.set("buyer_email", `eq.${email}`);
    query.searchParams.set("payment_status", "eq.paid");
    query.searchParams.set("order", "created_at.desc");
    query.searchParams.set("limit", "100");
    const result = await fetch(query, { headers });
    if (!result.ok) throw new Error(`Orders lookup ${result.status}`);
    const orders = await result.json();
    const purchased = orders.flatMap((order: any) => (order.northstar_order_items || []).map((item: any) => ({
      path: item.storage_object_path,
      price_id: item.stripe_price_id,
      order_id: order.id,
      created_at: order.created_at,
      amount_total: order.amount_total,
      currency: order.currency,
      livemode: order.livemode === true,
    })));

    if (url.searchParams.get("action") !== "download") {
      return respond({ products: purchased.map((item: any) => ({
        filename: item.path,
        price_id: item.price_id,
        order_id: item.order_id,
        created_at: item.created_at,
        amount_total: item.amount_total,
        currency: item.currency,
        livemode: item.livemode,
      })) });
    }

    const orderId = url.searchParams.get("order_id");
    const file = url.searchParams.get("file");
    const match = purchased.find((item: any) => item.order_id === orderId && item.path === file);
    if (!match) return respond({ error: "No purchase for this file" }, 403);

    const signedResult = await fetch(`${base}/storage/v1/object/sign/northstar-private-products/${encodeURIComponent(match.path)}`, {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ expiresIn: 60 }),
    });
    if (!signedResult.ok) throw new Error(`Storage signing ${signedResult.status}`);
    const signed = await signedResult.json();
    if (!signed.signedURL && !signed.signedUrl) throw new Error("Missing signed URL");

    const signedPath = String(signed.signedURL || signed.signedUrl);
    const resolved = signedPath.startsWith("https://")
      ? signedPath
      : new URL(signedPath.startsWith("/storage/v1/") ? signedPath : `/storage/v1/${signedPath.replace(/^\/+/, "")}`, base).toString();
    if (!resolved.startsWith(`${base}/storage/v1/object/sign/`)) throw new Error("Unexpected signed URL");
    const deliveryUrl = new URL(resolved);
    deliveryUrl.searchParams.set("download", match.path.split("/").pop() || "download");
    return respond({ url: deliveryUrl.toString(), expires_in: 60 });
  } catch (error) {
    console.error("Private delivery", error instanceof Error ? error.message : "unknown");
    return respond({ error: "Temporarily unavailable" }, 503);
  }
});
