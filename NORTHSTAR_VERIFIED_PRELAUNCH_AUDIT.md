# Northstar Studio — verified prelaunch audit (2026-11-08)

**Release status: BLOCKED.** Live checkout remains disabled. The draft PR is not merged or published.

## Verified

- Supabase project `hwsavnkammbhgizltqrc`: reversal-ordering migration was tested against a disposable local PostgreSQL 17 database and applied to production. Refund-before-checkout, checkout-before-refund, duplicate delivery, dispute precedence, and preservation of an existing paid order passed locally.
- No paid Supabase preview branch was created.
- Maria test-mode products and prices exist: email templates ($9), cleaning brand kit ($19), and niche bundle ($29).
- Maria's active sandbox webhook destination listens to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, and `charge.dispute.created`.
- Dedicated Maria test checkout and webhook functions are deployed; the checkout function is version 3 and webhook version 4. They reject live-mode credentials and are isolated from the shared Alexander test functions.
- Private bucket `northstar-private-products` contains the expected three private objects. Contents were inspected: 50 email starters; a 21-section cleaning kit; and a valid ZIP with 30 templates plus a start guide.
- A $9 email-template test checkout completed using the Stripe test card. Stripe reports paid in test mode. Its webhook delivery returned 503, so no new order row or library entitlement was recorded.
- The webhook code and sandbox configuration were corrected after that attempt. The current signing secret was inadvertently exposed in browser accessibility output and must be rotated by the owner before webhook retry.
- CI run 42527725433 (run 38) passed install, tests, and build for commit `6a17e25a57be465fc5be06854399b63ec82939c3`. This audit update will trigger a fresh PR check.
- The live production `stripe-test-store.html` remains unchanged and contains old Alexander Payment Links. Do not use them. The corrected Maria-only test storefront is still only on draft PR #3.
- Stripe Tax remains pending, with no confirmed head office or tax registrations. The legal seller has not been confirmed.
- Live checkout remains disabled; membership checkout remains paused.

## Remaining technical gates

- [ ] Owner rotates the exposed Maria sandbox webhook secret and replaces `NORTHSTAR_MARIA_TEST_WEBHOOK_SECRET` in Supabase.
- [ ] Resend the failed test event; verify exactly one Supabase order, the matching private object path, account library entry, and successful signed file retrieval.
- [ ] Verify wrong-order, wrong-file, unauthenticated, and expired-download access is denied.
- [ ] Test all three Maria test SKUs end to end.
- [ ] Verify duplicate event delivery, refund, dispute, and revocation after entitlement creation.
- [ ] Confirm latest PR CI passes.
- [ ] Review the updated test storefront and customer-facing product/legal copy before publication.

## Manual owner/legal gates

- [ ] Confirm the legal seller, business details, product licenses, support and refund process, and Stripe verification with the responsible adult.
- [ ] Resolve Stripe Tax head office, tax obligations, and registrations with the seller. Do not invent an address or tax treatment.
- [ ] Keep live sales disabled until all verification is complete and the owner explicitly approves launch.

## Release rule

No live checkout, real payment, paid preview branch, or merge is authorized by this audit. A paid sandbox session is technical test data, not evidence that the full payment-to-delivery path works.
