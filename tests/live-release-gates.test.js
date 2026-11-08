import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const checkout = readFileSync(new URL('../supabase/functions/northstar-live-checkout/index.ts', import.meta.url), 'utf8');
const webhook = readFileSync(new URL('../supabase/functions/northstar-live-webhook/index.ts', import.meta.url), 'utf8');
const store = readFileSync(new URL('../stripe-test-store.html', import.meta.url), 'utf8');
const shop = readFileSync(new URL('../shop.html', import.meta.url), 'utf8');
const pages = readFileSync(new URL('../pages.js', import.meta.url), 'utf8');
const membership = readFileSync(new URL('../membership.html', import.meta.url), 'utf8');
const account = readFileSync(new URL('../account.html', import.meta.url), 'utf8');

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

test('sandbox store uses Maria sandbox checkout and pauses membership', () => {
  assert.match(store, /Not a live store/);
  assert.match(store, /Maria Sheinin's Stripe account in test mode/);
  assert.match(store, /Membership checkout remains paused/);
  assert.doesNotMatch(store, /href="https:\/\/buy\.stripe\.com\//);
  assert.doesNotMatch(store, /Alexander Tsudikman/);
});

test('sandbox storefront keeps legal seller identity unconfirmed', () => {
  assert.match(store, /does not establish who may legally sell the products/);
  assert.match(store, /Confirm the legal seller, business details/);
  assert.doesNotMatch(store, /Maria Sheinin is the legal seller/);
  for (const page of [store, shop, pages, membership, account]) {
    assert.doesNotMatch(page, /Alexander Tsudikman/);
  }
  assert.match(shop, /Purchases are temporarily unavailable/);
});


test('future checkout requires US address and Stripe automatic tax before payment', () => {
  assert.ok(checkout.includes('"shipping_address_collection[allowed_countries][0]": "US"'));
  assert.ok(checkout.includes('"billing_address_collection": "required"'));
  assert.ok(checkout.includes('"automatic_tax[enabled]": "true"'));
  assert.match(checkout, /const LIVE_SALES_RELEASED = false;/);
});
