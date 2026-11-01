# Northstar Studio — sandbox deployment status (2026-11-01)

## Deployed (Supabase project hwsavnkammbhgizltqrc)
- `northstar-checkout` Edge Function: test-mode-only checkout session creator.
- `northstar-stripe-webhook` Edge Function: test-mode-only signed webhook processor.
- `northstar-private-downloads` Edge Function: updated CORS origin for https://northstar.atlaspointdigital.com.
- `northstar_stripe_events`, `northstar_memberships` tables with RLS and no public policies.
- Atomic server-only RPCs: `northstar_record_paid_checkout` and `northstar_record_membership`.

## Required operator configuration (do not put secrets in GitHub)
In Supabase project > Edge Functions > Secrets, configure:
- `STRIPE_SECRET_KEY`: Stripe **sandbox** secret key, starting `sk_test_`.
- `STRIPE_WEBHOOK_SECRET`: signing secret for the **sandbox webhook destination** created for this endpoint:
  `https://hwsavnkammbhgizltqrc.supabase.co/functions/v1/northstar-stripe-webhook`
- `STRIPE_PRICE_FOCUS`, `STRIPE_PRICE_LAUNCH`, `STRIPE_PRICE_CREATOR`: corresponding **sandbox** one-time Price IDs. Verify the product/price mapping rather than guessing from SKU names.
- `STRIPE_PRICE_MEMBERSHIP`: `price_1UX2FEAfTAEIufppHPNI9YnY` (sandbox $12/month).
- `NORTHSTAR_FILE_FOCUS`, `NORTHSTAR_FILE_LAUNCH`, `NORTHSTAR_FILE_CREATOR`: exact private object paths for matching products in bucket `northstar-private-products`.

The webhook must receive: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. Configure the endpoint in **Stripe sandbox**, not live mode.

Checkout endpoint: `https://hwsavnkammbhgizltqrc.supabase.co/functions/v1/northstar-checkout`. POST JSON `{"sku":"membership"}` from the allowed storefront origin. Browser should redirect to returned `url`. Do not send secret keys to browser.

## Still incomplete
- Verify secrets and price/object mappings.
- Connect frontend purchase buttons to the Checkout Edge Function (currently the test-store uses hosted Stripe test Payment Links).
- Test webhook delivery and check that exactly one order and order item appear after successful sandbox payment.
- Verify signed private download and that another user cannot access it.
- Implement verified subscription entitlement checks, customer portal, refund/dispute handling, failed payment lifecycle, and complete end-to-end tests.
- Resolve Stripe verification, legal name/DBA and tax obligations before any live payments.
- Never assume a redirect proves payment. Never enable live payments with sandbox keys or test webhooks.

## Security observations
All five public tables have RLS enabled. Supabase advisor flags no RLS policies on order/event/membership tables: this is intentional because these are server-managed and must not be directly writable/readable by browser clients. Advisor also flags leaked-password protection disabled; review in Auth settings if password login is enabled.
