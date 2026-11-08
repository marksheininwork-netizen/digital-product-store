# Maria Stripe sandbox — owner handoff (2026-11-08)

## Current status

- PR #3 on `northstar-prelaunch-ci-gates-20261108` remains a draft. Do not merge or publish it yet.
- The reversal-ordering migration passed a disposable local PostgreSQL test and was applied to Supabase production. No paid Supabase preview branch was created.
- Dedicated Maria test checkout and webhook functions are deployed (checkout v3, webhook v4). The checkout accepts only Maria's test prices and test-mode credentials.
- One $9 email-template checkout was completed using the Stripe test card. Stripe shows it as paid in test mode, but its webhook delivery returned 503 and no corresponding order or new library access was recorded.
- The webhook configuration was corrected and redeployed. The currently stored signing secret was inadvertently exposed in the browser accessibility output during diagnosis and must be rotated before retrying delivery.
- CI run 42527725433 (run 38) passed install, tests, and build for branch commit `6a17e25a57be465fc5be06854399b63ec82939c3`. This handoff update will trigger a fresh PR check.
- The production test-store page has not been updated. It still shows the old Alexander Payment Links; do not use those links. The branch version routes to Maria's sandbox and does not claim the legal seller is established.
- Stripe Tax is pending; seller identity and tax registrations remain unresolved. Live checkout remains disabled.

## Owner action required

A security policy requires the account owner to handle the credential rotation and entry themselves.

1. In Maria's Stripe test account, rotate the signing secret for the active “Northstar Studio Maria Sandbox Webhook” event destination.
2. Enter the new value in Supabase project `hwsavnkammbhgizltqrc` as `NORTHSTAR_MARIA_TEST_WEBHOOK_SECRET`. Keep the value out of chat and GitHub.
3. Tell Codex when the rotation is complete. The failed event can then be resent and delivery, the Supabase order row, and account access can be verified.

## Remaining verification

- Confirm the failed paid test event records exactly one email-template order and matching private object path.
- Fetch the delivered file from the signed-in library and verify it matches `email-swipe-file.txt`.
- Verify unauthorized and wrong-file downloads remain denied.
- Verify checkout, webhook, library access, and download for Cleaning Brand Kit ($19) and Niche Template Bundle ($29), using test mode only.
- Test duplicate event delivery, refund, dispute, and revocation after access is recorded.
- Confirm CI passes on the latest documentation commit before the PR is considered ready.

## Manual legal and launch gates

- Confirm who is legally selling the products, business details, applicable product licenses, support and refund process, and Stripe verification directly with the responsible adult.
- Resolve Stripe Tax head office and registration requirements with the seller; do not invent an address or tax treatment.
- Keep membership paused and live checkout disabled until the seller, tax, access, refund/dispute, and production webhook gates are complete and the owner explicitly approves launch.

## Maria test prices

- Email templates — $9: `price_1UZagOPKQ5OP9J0xXQ7hmn4s`
- Cleaning Brand Kit — $19: `price_1UZagQPKQ5OP9J0xxiZTjTVw`
- Niche Template Bundle — $29: `price_1UZagRPKQ5OP9J0xv5wjMrak`
