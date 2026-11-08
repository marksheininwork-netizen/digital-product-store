import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const webhook = readFileSync(new URL('../supabase/functions/northstar-maria-test-webhook/index.ts', import.meta.url), 'utf8');
test('Maria webhook only accepts signed test-mode events', () => {
  assert.match(webhook, /NORTHSTAR_MARIA_TEST_WEBHOOK_SECRET/);
  assert.match(webhook, /NORTHSTAR_MARIA_TEST_STRIPE_SECRET_KEY/);
  assert.match(webhook, /crypto\.subtle\.sign/);
  assert.match(webhook, /stripe-signature/);
  assert.match(webhook, /event\.livemode !== false/);
  assert.doesNotMatch(webhook, /NORTHSTAR_STRIPE_TEST_SECRET_KEY|STRIPE_WEBHOOK_SECRET|sk_live_/);
});
test('paid checkout verifies merchant-specific reference, product and payment status', () => {
  assert.match(webhook, /northstar-maria-test/);
  assert.match(webhook, /session\.payment_status !== "paid"/);
  assert.match(webhook, /session\.livemode !== false/);
  assert.match(webhook, /lines\.data\?\.length !== 1/);
  assert.match(webhook, /session\.amount_subtotal !== item\.amount/);
  assert.match(webhook, /northstar_record_paid_checkout/);
});
test('refund and dispute events require a verified Stripe charge', () => {
  assert.match(webhook, /charge\.refunded/);
  assert.match(webhook, /charge\.dispute\.created/);
  assert.match(webhook, /charge\.livemode !== false/);
  assert.match(webhook, /northstar_record_payment_reversal/);
});
