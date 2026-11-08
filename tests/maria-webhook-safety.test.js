import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isQualifyingRefund } from '../supabase/functions/northstar-maria-test-webhook/refund-qualifier.js';
const webhook = readFileSync(new URL('../supabase/functions/northstar-maria-test-webhook/index.ts', import.meta.url), 'utf8');
const checkout = readFileSync(new URL('../supabase/functions/northstar-maria-test-checkout/index.ts', import.meta.url), 'utf8');
test('Maria webhook only accepts signed test-mode events', () => {
  assert.match(webhook, /NORTHSTAR_MARIA_TEST_WEBHOOK_SECRET/);
  assert.match(webhook, /NORTHSTAR_MARIA_TEST_STRIPE_SECRET_KEY/);
  assert.match(webhook, /crypto\.subtle\.sign/);
  assert.match(webhook, /stripe-signature/);
  assert.ok(webhook.includes("/^t=\\d+$/"), "timestamp parser must match numeric Stripe signature timestamps");
  assert.match(webhook, /event\.livemode !== false/);
  assert.doesNotMatch(webhook, /NORTHSTAR_STRIPE_TEST_SECRET_KEY|STRIPE_WEBHOOK_SECRET|(?:sk|rk)_live_/);
});
test('checkout and webhook accept restricted sandbox keys but reject live keys', () => {
  assert.ok(checkout.includes("(?:sk|rk)_test_"));
  assert.ok(webhook.includes("(?:sk|rk)_test_"));
  assert.doesNotMatch(checkout + webhook, /(?:sk|rk)_live_/);
});
test('paid checkout verifies merchant-specific reference, product and payment status', () => {
  assert.match(webhook, /northstar-maria-test/);
  assert.match(webhook, /session\.payment_status !== "paid"/);
  assert.match(webhook, /session\.livemode !== false/);
  assert.match(webhook, /lines\.data\?\.length !== 1/);
  assert.match(webhook, /session\.amount_subtotal !== item\.amount/);
  assert.match(webhook, /northstar_record_paid_checkout/);
  assert.match(webhook, /session\.amount_total !== item\.amount/);
});
test('refund and dispute events require a verified Stripe charge', () => {
  assert.match(webhook, /charge\.refunded/);
  assert.match(webhook, /obj\.amount_refunded > 0/);
  assert.match(webhook, /isQualifyingRefund\(obj, charge\)/);
  assert.match(webhook, /charge\.dispute\.created/);
  assert.match(webhook, /charge\.livemode !== false/);
  assert.match(webhook, /northstar_record_payment_reversal/);
});
test('qualifying full and partial test refunds revoke access', () => {
  const eventCharge = { id: 'ch_test', livemode: false, payment_intent: 'pi_test', amount: 900, amount_refunded: 450 };
  const currentCharge = { ...eventCharge, amount_refunded: 450 };
  assert.equal(isQualifyingRefund(eventCharge, currentCharge), true);
  assert.equal(isQualifyingRefund({ ...eventCharge, amount_refunded: 900, refunded: true }, { ...currentCharge, amount_refunded: 900 }), true);
});
test('refunds with no amount, a mismatched intent, or an inconsistent charge do not qualify', () => {
  const base = { id: 'ch_test', livemode: false, payment_intent: 'pi_test', amount: 900, amount_refunded: 0 };
  assert.equal(isQualifyingRefund(base, base), false);
  const partial = { ...base, amount_refunded: 100 };
  assert.equal(isQualifyingRefund(partial, { ...partial, payment_intent: 'pi_other' }), false);
  assert.equal(isQualifyingRefund(partial, { ...partial, id: 'ch_other' }), false);
  assert.equal(isQualifyingRefund(partial, { ...partial, livemode: true }), false);
  assert.equal(isQualifyingRefund(partial, { ...partial, amount_refunded: 50 }), false);
  assert.equal(isQualifyingRefund(partial, { ...partial, amount_refunded: 901 }), false);
});
