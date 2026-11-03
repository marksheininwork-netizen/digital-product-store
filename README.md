# Northstar Studio

Northstar Studio is a digital-products and micro-SaaS storefront. The project uses a Vite multi-page frontend deployed through GitHub Actions to GitHub Pages at the custom domain `northstar.atlaspointdigital.com`.

## Development

```sh
npm install
npm run dev
npm run build
npm test
```

## Current integrations

- Supabase: authentication, customer profile settings, and secure purchased-file access through server-side entitlement checks.
- Stripe: the sandbox flow remains test-only. Live prices and a production webhook now exist, but checkout is still blocked by a source-level release guard and an environment switch. Live sales are not ready until merchant details, tax treatment, customer terms, and live credentials are verified.
- GitHub Actions: deployment to GitHub Pages. Verify deployment runs and actual browser behavior before claiming a release is live.

## Purchased-product access

The account page offers secure in-browser viewing, PDF preview, Save to Files, Word-compatible .doc, and Excel-compatible .csv options. Not every format is appropriate for every product. The Office-compatible exports are not native Microsoft cloud documents. Features require device testing.

Google Docs/Sheets and Google Sign-In are **deferred**; they are not currently live customer features. The ChatGPT Google Drive connector is not a backend credential for the storefront.

## Release tracking

See [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) for release validation, remaining features, legal requirements and production readiness.

The owner has authorized moving toward live sales. Keep checkout gated until legal, payment, tax, customer-support, and security requirements have been reviewed and verified.

## Payment mode separation

- Keep `northstar-sandbox-checkout` and `northstar-stripe-webhook` test-only.
- `northstar-live-checkout` requires both `LIVE_SALES_RELEASED` in source and `NORTHSTAR_LIVE_CHECKOUT_ENABLED=true`; the live webhook secret is configured in Supabase, but signed delivery, merchant, tax, customer terms, refund, payout, and support requirements still need verification. The owner has authorized the transition toward live sales; the source guard remains `false` until launch readiness is established.
- The live webhook writes to separate `livemode=true` order records and only accepts its mapped live price IDs after verifying the Stripe event, Checkout Session, paid status, amount, currency, and line item.
- The live webhook and private-download function source are tracked in `supabase/functions/`. Live Stripe credentials and webhook secrets must remain in Supabase secrets, never in the repository.
- The app does not offer live subscription checkout or portal access yet. Do not enable Toolbox Plus for real buyers until both access entitlements and subscription management are verified.
