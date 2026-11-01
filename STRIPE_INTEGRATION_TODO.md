# Stripe Checkout integration — remaining setup

## Scenario detection

**Scenario A**: An existing Stripe Checkout Session POST to `/v1/checkout/sessions` was found in [functions/api/checkout.js](functions/api/checkout.js). The integration uses a direct HTTPS request to Stripe (no Stripe SDK). Only the parameters of that existing request were changed. No new routes, auth, middleware, or webhook handlers were added.

## Values to Replace

The existing `mode`, `success_url`, and `cancel_url` are real application values and were preserved. `line_items[0][price]` is resolved from existing environment variables, not a literal `price_...` placeholder. **Verify that each variable contains a valid test Price ID.**

**Files containing environment placeholders:**
- [.env.example](.env.example)
- [functions/api/checkout.js](functions/api/checkout.js)

| Field | Current value | What to set |
|---|---|---|
| mode | `subscription` for membership; `payment` for other SKUs | Preserved; matches product type |
| success_url | `origin + '/?checkout=success&session_id={CHECKOUT_SESSION_ID}'` | Preserved; verify the destination works on the deployed host |
| cancel_url | `origin + '/?checkout=cancel'` | Preserved; verify the destination works on the deployed host |
| line_items[].price | `STRIPE_PRICE_FOCUS`, `STRIPE_PRICE_LAUNCH`, `STRIPE_PRICE_CREATOR`, `STRIPE_PRICE_MEMBERSHIP` | Set each environment variable to its actual matching Stripe Price ID. For membership test price: `price_1UX2FEAfTAEIufppHPNI9YnY`. Verify SKU mappings for all other products. |

## Configured Parameters

**File:** [functions/api/checkout.js](functions/api/checkout.js)

| Parameter | Value |
|---|---|
| ui_mode | `hosted_page` |
| billing_address_collection | `auto` |
| phone_number_collection.enabled | `false` |
| automatic_tax.enabled | `false` |
| allow_promotion_codes | `false` |
| payment_method_collection | `always` for subscription mode only |
| submit_type | `auto` |
| integration_identifier | `hosted_web_0001` |
| origin_context | `web` |

**Compatibility check required:** This code uses the Stripe REST API without a pinned SDK/API version. Verify that the connected account's Stripe API version accepts `ui_mode=hosted_page`, `origin_context`, and `integration_identifier=hosted_web_0001`. If the API rejects them, reconcile the Checkout Studio requirements with the supported API version before deployment; do not assume this change was successfully tested against Stripe.

## Setup and next steps

1. **Hosting:** The public storefront currently deploys to **GitHub Pages**, which does **not execute** `functions/api/checkout.js`. This existing handler is shaped for Cloudflare Pages Functions. Deploy it to a compatible server environment or adapt the checkout backend separately before treating online checkout as functional. Do not expose `STRIPE_SECRET_KEY` in Vite/browser code.
2. **Secrets:** Set `STRIPE_SECRET_KEY` in the backend's secret manager; set all `STRIPE_PRICE_*` values in the same backend environment. Use restricted Stripe API keys where feasible. Never commit real secrets. `.env.example` is illustrative, not a production secret store.
3. **Subscription:** Set `STRIPE_PRICE_MEMBERSHIP=price_1UX2FEAfTAEIufppHPNI9YnY` in the **sandbox backend** only. Use a separately verified live price for production.
4. **Webhooks:** Existing [functions/api/webhook.js](functions/api/webhook.js) must be inspected, deployed and completed with signature verification and idempotent fulfillment before accepting purchases. Required events include paid Checkout completion, asynchronous payment success/failure, subscription lifecycle and invoices; handle refunds/disputes as applicable. Store customer/subscription identifiers with authenticated accounts. Do not grant access solely from the success URL.
5. **Account and fulfillment:** Verify login, download entitlements, membership activation, renewals, cancellation, payment failure, and Stripe Customer Portal integration. Ensure server-side access checks.
6. **Testing:** In Stripe sandbox use test card `4242 4242 4242 4242`, a future expiry date, any CVC, and an eligible test billing address. Confirm both one-time and subscription checkout, webhook delivery, duplicate events, failed payments, and cancellations. **No live charges have been tested.**
7. **Tax:** Automatic tax remains disabled as specified by Checkout Studio. Before going live, determine applicable sales-tax/VAT/GST obligations and registrations; don't assume manual tax means no tax is owed.
8. **Go live:** Complete Stripe account verification and business eligibility, create live products/prices, configure live backend secrets and webhook endpoint, and run production readiness checks.

## Files created

- [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md) — this checklist.

## Checkout flow

Browser posts a SKU to the backend endpoint → backend selects the configured Stripe Price ID and creates a hosted Checkout Session → browser redirects to Stripe → Stripe redirects to existing success/cancel URLs → **verified webhook** grants access after successful payment.

## Resources

- https://support.stripe.com
- https://docs.stripe.com/mcp
- https://docs.stripe.com/checkout/quickstart
- https://docs.stripe.com/billing/taxes/collect-taxes
