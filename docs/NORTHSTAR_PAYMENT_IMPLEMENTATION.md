# Northstar Studio sandbox payment integration

## Architecture
- GitHub Pages serves the static storefront.
- Supabase Edge Functions host sandbox Checkout Session creation and signed Stripe webhook processing.
- Stripe test-mode webhook is the only source of paid order entitlements.
- Supabase private storage serves short-lived signed URLs after authenticated ownership checks.
- Never expose Stripe secret keys or Supabase service-role credentials in browser code.

## Deployment gates
1. Add Stripe test secret key and webhook signing secret to Supabase Edge Function secrets.
2. Map each SKU to a verified test-mode Stripe Price ID and a private storage object.
3. Deploy the sandbox checkout function with explicit CORS for the real storefront origin.
4. Implement webhook event idempotency, payment verification and order/item persistence.
5. Add subscription lifecycle handling and a customer portal endpoint.
6. Test paid, failed, refunded, duplicate, delayed, subscription cancellation and renewal events.
7. Confirm account login and downloads work on the custom domain.
8. Keep production checkout disabled until owner verification, business eligibility, taxes and live end-to-end tests pass.

## Existing blockers
- GitHub Pages does not execute Cloudflare Pages Functions under functions/api.
- Existing northstar-test-webhook acknowledges signed test events but deliberately does not fulfill orders.
- Existing account.js uses a verified-email private download function; it must not treat a success redirect as proof of payment.
- Stripe live account ID verification remains outstanding.

## Security acceptance criteria
- No client-controlled price, amount or file path is trusted.
- Every Stripe event has a verified signature and is handled idempotently.
- An unpaid, refunded or disputed order cannot grant download access.
- Signed file URLs are short-lived and only issued to verified authenticated purchasers.
- Subscription access is granted and revoked by server-verified Stripe state.
