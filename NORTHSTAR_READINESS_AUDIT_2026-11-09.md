# Northstar readiness audit — 2026-11-09

This is a test-only readiness record. It does not authorize live sales, tax collection, deployment, or a merge.

## Current environment

- Remote `main` was at `b9121abedcf4c5f7c93c0616d02e270bda0257d2` when inspected. The latest commits on main were November 8, 2026. Draft PRs #3 and #4 remained open; neither was merged.
- The deployed site is [northstar.atlaspointdigital.com](https://northstar.atlaspointdigital.com). No separate staging domain or PR preview was found. Do not describe this production custom domain as staging.
- Supabase project `hwsavnkammbhgizltqrc` is active. `northstar-private-products` is private. Test and live Edge Functions/Stripe keys are separated. Live checkout source release is locked; live purchases remain unavailable.
- Maria Sheinin is the intended individual sole-proprietor seller. The Certificate of Authority was reported approved on November 9, but the document was not independently reviewed in this audit. Do not infer product taxability or permission to collect tax from the certificate alone.
- The deployed custom-domain pages were stale relative to current main and still showed Alexander Tsudikman in seller copy. This conflicts with the latest owner decision and blocks launch. No production deployment was made.

## Products and Stripe configuration

| Offer | Maria Test price | Mapped file | Content review |
| --- | ---: | --- | --- |
| 50 Editable Email Templates | $9 one-time | `email-swipe-file.txt` | Text contents reviewed: 50 editable starters and usage/compliance cautions. |
| Cleaning Business Brand Kit | $19 one-time | `cleaning-business-brand-kit.txt` | Text contents reviewed: client workflow and brand templates with professional-advice disclaimers. |
| Niche Template Bundle | $29 one-time | `niche-template-bundle.zip` | Private object and mapping verified; ZIP bytes/entries were not accessible for review. |
| Toolbox Plus | $12/month proposed | No active Maria Test mapping | Paused in storefront; not included in checkout. |

The three Maria Test one-time prices are tax-exclusive and USD. Their Stripe Tax product tax codes are unset. Test Checkout automatic tax is disabled. No product tax code or live tax setting was changed. Natural Studio Commerce was not accessed or modified.

## Verified sandbox purchase and refund

- Completed a Maria Test Checkout for the $19 Cleaning Business Brand Kit with a Stripe test card. Retrieved Checkout Session was complete and paid, `livemode=false`, one mapped line item, amount $19.00, tax $0, `automatic_tax.enabled=false`.
- Supabase recorded one paid test order and one private-file entitlement for `cleaning-business-brand-kit.txt`. The authenticated production account showed the purchase after Checkout and after reload.
- The account’s CSV export action fetched the purchased private file and produced a `Save cleaning-business-brand-kit.csv` blob link. The browser’s download capture timed out, so an operating-system file save was not confirmed.
- Issued a full refund of that same test-mode payment only. Stripe recorded a successful $19 test refund; the signed refund webhook recorded a `refunded` event, changed the order to refunded, and a library refresh removed the Cleaning Business Brand Kit while preserving the three Email purchases.
- The separate test order was refunded after entitlement verification. No live charge or live refund occurred.

## Tax and seller disclosures

- Stripe Live currently shows an active New York state sales-tax registration, effective November 9, 2026. This is an observed Stripe registration, separate from the reported Certificate of Authority.
- Stripe Live product tax codes remain unset; live Checkout automatic tax is not enabled. The $19 sandbox session did not calculate tax and is not evidence of safe tax calculation.
- A qualified tax adviser/owner must classify each item and decide applicable registrations before enabling collection. No tax-code choice was made.
- Reconcile the Stripe Live legal-entity record, public seller name, receipt/statement identity, and deployed disclosures to Maria before any launch. Do not use Alexander’s or another merchant’s Stripe account or products.

## Auth, fulfillment, and verification limits

- Supabase Auth Site URL is `https://northstar.atlaspointdigital.com`. The exact account redirect is allowlisted. A magic-link sign-in on that actual domain succeeded, the session survived reload, and purchases loaded by verified email.
- The private-download function source checks the signed-in user and confirmed email, selects paid orders server-side, and issues a 60-second signed URL only for an entitled file. Database order/item tables remain server-only under RLS.
- The download flow was exercised for an entitled account. Invalid webhook signature, duplicate webhook delivery, failed payment, dispute, expired signed URL, and unauthorized direct file access were not exercised against the deployed Maria Test endpoint. The local runtime suite covers the separate live-webhook handler’s signature/reversal guards, not the Maria Test webhook’s full case matrix.
- A second authenticated browser session and real mobile viewport were not verified: the available browser could not apply a 390-pixel viewport, and the other visible Google tab belonged to a school profile and was left untouched. Do not treat the clipped screenshot as a mobile pass.
- The browser could not capture a completed operating-system download; the generated CSV blob and entitled private-file fetch were observed.
- Local verification on the existing, stale `northstar-live-purchase-readiness` checkout: `npm test` passed 31/31 and `npm run build` passed. That checkout was based on an older commit and contains pre-existing uncommitted changes, including stale Alexander seller text; it was not committed. This audit branch is based on current remote main.

## Owner actions before any launch

1. Confirm Maria’s Stripe Live legal-entity record and required verification status in Stripe herself; reconcile all deployed public seller, support, and receipt disclosures.
2. Have a qualified adviser classify the three downloadable items and recurring plan for New York and other target jurisdictions; set appropriate product tax codes and verify tax calculations only after requirements and registrations are confirmed.
3. Review the Niche ZIP contents and confirm the customer refund/support process is monitored.
4. Obtain a successful Maria Test $29 ZIP fulfillment test and complete the missing webhook, access-control, expiration, duplicate, failed-payment, dispute, second-session, and mobile cases.
5. Keep live checkout, live automatic tax, and subscriptions disabled until those gates are complete and the owner approves a production release.
