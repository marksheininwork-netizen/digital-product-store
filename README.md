# Northstar Studio — Digital Product Store

A responsive Vite storefront prototype with Cloudflare Pages Functions and a Stripe-hosted Checkout **test-mode scaffold**.

## Current implementation
- Mobile-responsive storefront with three illustrative products and a membership preview.
- Stripe Checkout server endpoint at `POST /api/checkout` accepts a strict SKU allowlist, reads Stripe secret and price IDs only from Cloudflare environment variables, and returns a hosted checkout URL.
- Checkout buttons remain disabled pending actual downloadable products and verified fulfillment.
- Customer portal and webhook routes deliberately return 503 until authenticated customer access and signed webhook verification are implemented.
- **No payment fulfillment, subscriptions, live transactions, or deployment is claimed.**

## Local development
```bash
npm install
npm run dev
npm run build
```
Cloudflare Pages Functions require a compatible Cloudflare local environment for API testing; Vite alone serves the frontend.

## Cloudflare deployment
- Framework: Vite; build command: `npm run build`; output directory: `dist`.
- Connect this GitHub repo to Cloudflare Pages. Set Stripe values as encrypted environment secrets (see `.env.example`).
- Do not set production Stripe keys before signed webhook verification and private-file fulfillment are finished.

## Before enabling purchases
1. Create original downloadable products and private storage; define actual license and refund terms.
2. Create matching Stripe test products/prices; add price IDs and test secret key in Cloudflare environment.
3. Implement webhook signature verification using raw request body and `STRIPE_WEBHOOK_SECRET`.
4. Implement durable order records, idempotent fulfillment, signed download links, and subscription entitlement updates.
5. Implement customer identity and secure Billing Portal creation server-side.
6. Test success, cancellation, declined payments, disputes, refunds, subscription renewal and cancellation.
7. Complete Stripe business activation and move to live mode only with account-owner approval.

Never expose Stripe secret keys in the browser or commit them to GitHub.
