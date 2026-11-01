# Northstar Studio — launch gate (test-mode only)

Last reviewed: 2026-10-31

## Verified foundation
- GitHub Pages storefront and account portal are available.
- Supabase Auth email-link sign-in, private bucket, and order recorder are deployed.
- Customer reported successful account, purchase, preferences, and download tests.
- Supabase database contains paid **test** orders and three product objects.
- Live payment processing is **not** enabled.

## Must pass before taking real payments
- [ ] Review actual contents of all three product files for accuracy, usefulness, spelling, rights, and promised quantity. Check ZIP extraction and PDF/text readability.
- [ ] Verify checkout email, paid amount, currency, price ID, and line items for all products.
- [ ] Test failed payments, duplicate webhook deliveries, delayed payment, and replayed webhook signatures.
- [ ] Implement and verify refund/dispute event handling: revoke access to refunded/disputed orders, and verify no new signed URLs can be generated.
- [ ] Confirm download URL expiry, private-bucket denial, anonymous access denial, wrong-user access denial, and inaccessible/expired sessions.
- [ ] Add an order confirmation experience and a clear customer support/refund contact.
- [ ] Review privacy, terms, refund policy, product licensing, and applicable sales-tax requirements.
- [ ] Check Stripe account verification and whether the legal business owner can activate live payments.
- [ ] Configure a **separate** live webhook endpoint and live-mode secrets; never reuse test credentials.
- [ ] Complete a low-value, owner-approved live transaction, refund, and access-revocation test before promoting the store.

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
