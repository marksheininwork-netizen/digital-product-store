# Sandbox checkout deployment

Supabase Edge Function `northstar-sandbox-checkout` is deployed in project `hwsavnkammbhgizltqrc`.

Endpoint:
https://hwsavnkammbhgizltqrc.supabase.co/functions/v1/northstar-sandbox-checkout

## Required server-side secrets
- NORTHSTAR_STRIPE_TEST_SECRET_KEY (must begin sk_test_)
- NORTHSTAR_PRICE_FOCUS
- NORTHSTAR_PRICE_LAUNCH
- NORTHSTAR_PRICE_CREATOR
- NORTHSTAR_PRICE_MEMBERSHIP

POST JSON: {"sku":"focus"} (or launch, creator, membership).

Only these browser origins are allowed:
- https://northstar.atlaspointdigital.com
- https://marksheininwork-netizen.github.io

This endpoint has no live-key support. A successful checkout is NOT proof of fulfillment. The existing test webhook still deliberately does not grant purchases. Do not enable purchase buttons for general customers until signed webhook processing, order idempotency, private downloads and subscriptions are tested.

## Next verification
- Configure secrets using the Supabase dashboard secret manager, not GitHub source.
- Verify Stripe test checkout creation for each SKU.
- Verify webhooks with signed events and duplicate delivery.
- Verify paid orders produce correct private file access and unpaid orders do not.
- Verify refunds, disputes and subscriptions.
- Perform live readiness and identity checks separately.
