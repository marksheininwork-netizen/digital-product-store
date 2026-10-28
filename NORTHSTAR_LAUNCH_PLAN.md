# Northstar Studio — 30-Day Launch Plan

## Safety gates
- Keep live checkout disabled until signed webhook verification, durable order records, and entitlement-based downloads are tested.
- Never store Stripe secret keys in Vite client code.
- Do not treat a success redirect as proof of payment.
- No custom website design services.

## Phase 1 — Catalog and accessibility
- [x] Existing Vite catalog inspected.
- [ ] Add keyboard-friendly product search and category filters.
- [ ] Add real downloadable resources with clear license and preview.
- [ ] Remove placeholder contact email and add working support channel.
- [ ] Verify mobile layouts, focus indicators, and reduced-motion support.

## Phase 2 — Identity and fulfillment
- [ ] Supabase Auth, Row Level Security, private storage.
- [ ] Stripe test-mode webhook signature verification and idempotent order processing.
- [ ] Verified download authorization and expiration.
- [ ] Customer library and billing portal with server-side ownership checks.
- [ ] Refund and subscription status reconciliation.

## Phase 3 — SaaS
- [ ] Free tools: invoice generator, timer, pricing calculator, text cleaner.
- [ ] Paid tools: invoice history, recurring templates, content calendar, project dashboards.
- [ ] Feature flags and usage quotas enforced server-side.

## Release checklist
- [ ] npm install and npm run build pass.
- [ ] Browser checks at 375px, 768px and desktop.
- [ ] Automated accessibility and navigation tests.
- [ ] Stripe test scenarios: payment, cancellation, duplicate webhook, refund, failed renewal.
- [ ] Confirm deployed URL and verify functionality directly.
- [ ] Live payments require separate explicit approval.

## Pricing hypothesis (not active prices)
- Downloads $5–$149.
- SaaS $5–$49 per month.
- Bundles and membership after verified entitlement controls.
