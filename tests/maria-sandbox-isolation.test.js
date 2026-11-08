import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const checkout = readFileSync(new URL('../supabase/functions/northstar-maria-test-checkout/index.ts', import.meta.url), 'utf8');

test('Maria test checkout uses a dedicated test key, never live or legacy shared secrets', () => {
  assert.match(checkout, /NORTHSTAR_MARIA_TEST_STRIPE_SECRET_KEY/);
  assert.ok(checkout.includes("(?:sk|rk)_test_"));
  assert.doesNotMatch(checkout, /NORTHSTAR_STRIPE_TEST_SECRET_KEY|NORTHSTAR_STRIPE_LIVE_SECRET_KEY|sk_live_/);
  assert.match(checkout, /session\.livemode !== false/);
});
test('Maria checkout uses the three verified one-time test prices', () => {
  for (const price of ['price_1UZagOPKQ5OP9J0xXQ7hmn4s','price_1UZagQPKQ5OP9J0xxiZTjTVw','price_1UZagRPKQ5OP9J0xv5wjMrak']) {
    assert.ok(checkout.includes(price));
  }
  assert.match(checkout, /mode: "payment"/);
  assert.doesNotMatch(checkout, /mode: "subscription"/);
  assert.match(checkout, /shipping_address_collection\[allowed_countries\]\[0\]/);
  assert.match(checkout, /"US"/);
});
test('test checkout is origin restricted and does not expose secrets to browser', () => {
  assert.match(checkout, /req\.headers\.get\("origin"\) !== site/);
  assert.match(checkout, /"cache-control": "no-store"/);
  assert.match(checkout, /test_mode: true/);
  assert.doesNotMatch(checkout, /return reply\(\{[^}]*key/);
});
