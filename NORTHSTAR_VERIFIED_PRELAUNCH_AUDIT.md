# Northstar Studio — verified prelaunch audit (2026-11-08)

**Release status: BLOCKED.** No live checkout activation, tax registration, payment collection, or deployment authorized by this audit.

## Verified via connected systems

- GitHub Actions run 42508676444 on commit 34ed29f798cda21538266c6fa3bf5e38b7139c90: **success**; tests and storefront build completed.
- Supabase project `hwsavnkammbhgizltqrc`: three paid **sandbox** orders; zero live orders.
- Storage bucket `northstar-private-products`: `public=false`, three objects (`email-swipe-file.txt`, `cleaning-business-brand-kit.txt`, `niche-template-bundle.zip`). Object presence does not establish content correctness.
- Five payment-recording SQL functions have `anon_execute=false`, `authenticated_execute=false`, and `service_execute=true`.
- Supabase health and performance advisors: no reported lints. Security advisor: leaked-password protection disabled; five payment tables have RLS enabled without policies. These tables are intentionally server-only; do not add permissive policies merely to silence a lint.
- Stripe connected accounts: Maria Sheinin is the live account; Alexander Tsudikman is the separate sandbox account. **Do not treat Alexander's sandbox transactions as a test of Maria's merchant account.**
- The source-level live sales lock `LIVE_SALES_RELEASED = false` remains in place.
- The draft branch prepares Stripe-hosted U.S. address eligibility, required billing address, and `automatic_tax[enabled]=true` behind the existing hard lock. Not deployed.

## Technical gates still requiring real verification

- [ ] Use a **Maria-owned Stripe sandbox** for payment tests; do not rely on Alexander's sandbox as equivalent.
- [ ] Verify checkout creates exactly one intended product, and unpaid/expired/failed payments grant no access.
- [ ] Exercise a real sandbox payment -> signed webhook -> order record -> verified-user product listing -> signed download -> actual file fetch.
- [ ] Test webhook duplicate delivery, delayed delivery, signature failure, refunds, disputes, and reversal-before-checkout ordering.
- [ ] Verify cross-account download denial, wrong-file denial, expired tokens, email verification, and absence of leaked download URLs.
- [ ] Validate Stripe's U.S.-only shipping-address restriction and ensure foreign buyers cannot complete checkout. Confirm the extra shipping-address collection is acceptable for digital products.
- [ ] Confirm automatic tax calculation and tax registrations in the correct merchant account; do not enable real sales before registration.
- [ ] Inspect actual files and licenses to assign product-specific Stripe Tax codes; do not infer classification from product names alone.
- [ ] Review leaked-password protection in Supabase Auth; enable when supported by plan/settings, and retest signup/sign-in.
- [ ] Confirm production support inbox, refund process, site disclosures, and customer access flows.
- [ ] Merge/deploy only after review, and keep hard-coded live release lock off until explicit approval.

## Human/legal gates

- [ ] Maria confirms merchant responsibility, Stripe verification, payouts, and bank ownership directly with Stripe.
- [ ] Confirm assumed-name/DBA requirements, product licenses, and tax treatment with appropriate professional advice.
- [ ] Complete NY Certificate of Authority if required before taxable sales; then register the jurisdiction in Maria's Stripe Tax account.
- [ ] Obtain explicit go-live authorization after all tests and registrations.

## Release rule

Passing CI, a working webhook endpoint, or existing sandbox orders are **not** evidence of a complete live payment-to-delivery journey. Do not change `LIVE_SALES_RELEASED` to `true` or reactivate Payment Links until all relevant gates are verified.
