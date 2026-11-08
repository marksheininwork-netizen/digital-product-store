# Maria Stripe sandbox — owner handoff (2026-11-08)

## Status
Draft-only code on PR #3 branch `northstar-prelaunch-ci-gates-20261108`. No new Maria checkout or webhook deployed. No migration applied. No live payment changes. Latest branch CI has not been confirmed; do not represent static tests as end-to-end payment verification.

## Owner-only prerequisites
1. In Maria's **test** Stripe account (not Alexander's, not Maria Live), obtain a restricted/test secret API key suitable for Checkout Session creation and retrieving sessions, line items, and charges. Configure it in Supabase as `NORTHSTAR_MARIA_TEST_STRIPE_SECRET_KEY`. Do not paste keys into GitHub or chat.
2. Create a **separate Maria test** Stripe webhook destination targeting the eventual `northstar-maria-test-webhook` function URL, with `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created`. Store that destination's signing secret as `NORTHSTAR_MARIA_TEST_WEBHOOK_SECRET` in Supabase. Do not replace the shared `STRIPE_WEBHOOK_SECRET`.
3. Confirm Stripe Tax head office and seller tax obligations with the adult legal seller. Stripe Tax is currently pending; the isolated sandbox intentionally omits automatic tax. Live activation requires a separate legal/tax decision.
4. Approve isolated test deployment and a sandbox purchase/refund verification. Keep live checkout disabled.

## Engineering gate after prerequisites
- Run `npm ci && npm test && npm run build` on the PR head and inspect results.
- Review the reversal-ordering migration and apply it only after a disposable-transaction test verifies refund-before-checkout, checkout-before-refund, duplicate delivery, and disputed orders remain inaccessible.
- Deploy isolated Maria test checkout and webhook with dedicated secrets. Never overwrite Alexander/shared Stripe environment variables.
- Verify one successful purchase for each Maria test price, the exact private file delivered to the matching confirmed buyer, unauthorized access denied, and refund/dispute revocation.
- Verify website navigation, legal copy, seller details, actual product contents, and account login.
- Do not merge PR or enable live sales before the above pass and the adult owner approves.

## Price IDs
- emails: `price_1UZagOPKQ5OP9J0xXQ7hmn4s` ($9)
- cleaning: `price_1UZagQPKQ5OP9J0xxiZTjTVw` ($19)
- niche: `price_1UZagRPKQ5OP9J0xv5wjMrak` ($29)

## Existing storage objects (existence checked, content quality not verified)
- `email-swipe-file.txt` (20,208 bytes)
- `cleaning-business-brand-kit.txt` (11,200 bytes)
- `niche-template-bundle.zip` (17,121 bytes)

## Caution
The static source tests are guardrails, not proof of a successful Stripe webhook, a working database migration, or secure file delivery in production.
