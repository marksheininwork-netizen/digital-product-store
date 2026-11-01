# Northstar Studio — launch gate (test-mode only)

Last reviewed: 2026-10-31

## Verified foundation
- GitHub Pages storefront and account portal are available.
- Supabase Auth email-link sign-in, private bucket, and order recorder are deployed.
- Customer reported successful account, purchase, preferences, and download tests.
- Supabase database contains paid **test** orders and three product objects.
- Live payment processing is **not** enabled.

## Current build and testing priorities
- [ ] Review actual contents of all three product files for accuracy, usefulness, spelling, rights, and promised quantity. Check ZIP extraction and PDF/text readability.
- [ ] Verify checkout email, paid amount, currency, price ID, and line items for all products.
- [ ] Test failed payments, duplicate webhook deliveries, delayed payment, and replayed webhook signatures.
- [ ] Confirm download URL expiry, private-bucket denial, anonymous access denial, wrong-user access denial, and inaccessible/expired sessions.
- [ ] Add an order confirmation experience within the portal.
- [ ] Configure a **separate** live webhook endpoint and live-mode secrets; never reuse test credentials.
- [ ] Keep Stripe in test mode until final launch requirements are addressed.

## Security model
The browser contains only a public Supabase publishable key. It must never contain the service-role key or Stripe secret key. The private download function verifies a Supabase Auth session and confirmed email, looks up paid orders server-side, then creates 60-second signed URLs. Existing order rows are deliberately inaccessible directly to browser roles. User profile rows have per-user RLS policies.

## Known limitations
- The current order recorder handles paid checkout events, not refund or dispute revocation.
- The subscription section is informational; no recurring billing or customer billing portal is active.
- Purchase emails are not yet automatically sent by Northstar after payment.
- Account preferences are saved, but email marketing is not enabled.
- Product files have not been independently reviewed for commercial quality.
- Live mode is not configured. Do not advertise real purchases until all launch gates pass.

## Test links
- Account: https://marksheininwork-netizen.github.io/digital-product-store/account.html
- Test store: https://marksheininwork-netizen.github.io/digital-product-store/stripe-test-store.html
- Supabase: https://supabase.com/dashboard/project/hwsavnkammbhgizltqrc
- GitHub Actions: https://github.com/marksheininwork-netizen/digital-product-store/actions

## FINAL-STAGE DETAILS — do these at the very end
These items are intentionally deferred until the rest of the website, products, portal, and test-mode flow work well. They are **not waived**. Do not accept real payments or launch publicly before resolving applicable requirements.

- [ ] Refund policy, refund processing, dispute handling, and revocation of access when appropriate.
- [ ] Legal: business ownership/eligibility, tax obligations, privacy policy, terms, licensing, consumer protections, and payment compliance.
- [ ] Google login: configure OAuth credentials, redirect URLs, consent screen, and security testing.
- [ ] Contact: support email/contact form, customer help flow, and response process.
- [ ] Stripe live-mode activation and a fully authorized end-to-end live purchase/refund test after the above are ready.

**Priority rule:** Work on product quality, storefront UX, test-mode checkout, account portal, and technical tests first. Treat the final-stage list as a launch gate, not as optional features.
