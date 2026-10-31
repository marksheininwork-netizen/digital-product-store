# Northstar Studio — Stripe Test Fulfillment

Status: **backend scaffold committed, NOT deployed**.

## Architecture
- Static storefront: GitHub Pages.
- Checkout: Stripe-hosted **test** Payment Links.
- Payment verification and private downloads: Cloudflare Worker in `fulfillment/worker.js`.
- Private product files: Cloudflare R2 bucket binding `DOWNLOADS` (never expose as public assets).
- No customer account/library yet. A paid Checkout Session ID acts as a bearer credential; do not share it, log it, or put it in public analytics.

## Configure
1. Create a Cloudflare R2 bucket for Northstar paid files; note any R2 storage/operations charges before enabling.
2. Upload **finished, accurate paid editions** named:
   - `email-swipe-file.txt`
   - `cleaning-business-brand-kit.txt`
   - `niche-template-bundle.zip`
   The public free versions are NOT protected. Do not charge for a bundle that has not been finished and uploaded.
3. Deploy `fulfillment/worker.js` with a private R2 binding named `DOWNLOADS`.
4. Configure Worker secrets `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from the **same Stripe test account**. Never commit them or expose them to frontend code.
5. In Stripe test dashboard, register the Worker endpoint `/stripe-webhook`, subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Use the endpoint-specific signing secret.
6. Complete a test checkout; retrieve its Checkout Session ID and verify `GET /purchases?session_id=cs_test_...` lists only purchased products. Verify `GET /download?session_id=cs_test_...&file=...` returns the private object. Test invalid IDs, unpaid sessions, wrong file, missing object, duplicate webhook deliveries and tampered webhook signatures.
7. Do not enable live links until taxes, business identity, refunds, product licensing, secure customer authentication and delivery email flows are ready.

## Security and limitations
- The Worker independently queries Stripe for each access request. It never trusts client-supplied price or payment status.
- This first version uses Checkout Session IDs as bearer credentials; it is suitable for **test-only validation**, not a full customer library. Production needs authenticated accounts or short-lived one-time download tokens, request rate limiting, audit logs, and secure email delivery.
- Webhook currently verifies and acknowledges test events but does **not** persist orders, send emails, or issue access tokens. Fulfillment is on-demand via Stripe session verification.
- The three Stripe links use `after_completion=hosted_confirmation`, so customers are **not automatically redirected** to a delivery page.
- Payment Links and prices are test-only. Test prices: $9, $19, $29.
- There is no recurring subscription fulfillment implemented.
- Existing publicly accessible versions of products remain free. Paid versions must offer distinct value and transparent descriptions.

## Current Stripe test price mapping
- `price_1UWRdGAfTAEIufppLb4bkU7K` → email swipe file
- `price_1UWRdIAfTAEIufppDPILb63e` → cleaning brand kit
- `price_1UWRdJAfTAEIufppJzlHx1xO` → niche template bundle

## Recommended next milestone
Build the finished paid assets, upload to private storage, add a verified order ledger and customer authentication, then run automated integration tests before enabling automatic delivery.
