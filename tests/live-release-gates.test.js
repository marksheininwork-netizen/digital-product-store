import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const checkout = readFileSync(new URL('../supabase/functions/northstar-live-checkout/index.ts', import.meta.url), 'utf8');
const webhook = readFileSync(new URL('../supabase/functions/northstar-live-webhook/index.ts', import.meta.url), 'utf8');
const store = readFileSync(new URL('../stripe-test-store.html', import.meta.url), 'utf8');

test('live checkout remains fail-closed pending release approval', () => {
  assert.match(checkout, /const LIVE_SALES_RELEASED = false;/);
  assert.match(checkout, /NORTHSTAR_LIVE_CHECKOUT_ENABLED/);
  assert.match(checkout, /return reply\(\{ error: "Purchases are not yet available/);
  assert.match(checkout, /"consent_collection\[terms_of_service\]": "required"/);
});

test('live catalog has exactly the three approved one-time products', () => {
  for (const sku of ['emails', 'cleaning', 'niche']) assert.match(checkout, new RegExp('\\b' + sku + ': \\{ priceSecret:'));
  assert.doesNotMatch(checkout, /mode: "subscription"/);
  assert.doesNotMatch(checkout, /toolbox:\s*\{/);
});

test('live webhook verifies signatures and excludes sandbox events', () => {
  assert.match(webhook, /verifySignature\(raw,/);
  assert.match(webhook, /event\.livemode !== true/);
  assert.match(webhook, /session\.livemode !== true/);
  assert.match(webhook, /northstar_record_live_paid_checkout/);
  assert.match(webhook, /northstar_record_live_payment_reversal/);
});

test('sandbox store labels links as test-only and pauses membership', () => {
  assert.match(store, /Not a live store/);
  assert.match(store, /Subscription checkout paused/);
  assert.doesNotMatch(store, /href="https:\/\/buy\.stripe\.com\/(?!test_)/);
});
