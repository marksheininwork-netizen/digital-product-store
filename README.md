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
- Stripe: **test mode only**. The separate live checkout function remains blocked by a source-level release guard and an environment switch. It offers only three one-time digital products; Toolbox Plus stays excluded until membership access and live billing management are complete.
- GitHub Actions: deployment to GitHub Pages. Verify deployment runs and actual browser behavior before claiming a release is live.

## Purchased-product access

The account page offers secure in-browser viewing, PDF preview, Save to Files, Word-compatible .doc, and Excel-compatible .csv options. Not every format is appropriate for every product. The Office-compatible exports are not native Microsoft cloud documents. Features require device testing.

Google Docs/Sheets and Google Sign-In are **deferred**; they are not currently live customer features. The ChatGPT Google Drive connector is not a backend credential for the storefront.

## Release tracking

See [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) for release validation, remaining features, legal requirements and production readiness.

**Do not enable live payments until legal, payment, tax, and security requirements have been reviewed and verified.**

## Payment mode separation

- Keep `northstar-sandbox-checkout` and `northstar-stripe-webhook` test-only.
- `northstar-live-checkout` requires both `LIVE_SALES_RELEASED` in source and `NORTHSTAR_LIVE_CHECKOUT_ENABLED=true`; the source guard is intentionally `false` until the owner approves launch.
- The live webhook writes to separate `livemode=true` order records and only accepts its mapped live price IDs after verifying the Stripe event, Checkout Session, paid status, amount, currency, and line item.
- The live webhook and private-download function source are tracked in `supabase/functions/`. Live Stripe credentials and webhook secrets must remain in Supabase secrets, never in the repository.
- The app does not offer live subscription checkout or portal access yet. Do not enable Toolbox Plus for real buyers until both access entitlements and subscription management are verified.
