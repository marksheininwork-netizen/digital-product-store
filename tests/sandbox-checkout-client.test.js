import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const client=readFileSync(new URL('../src/sandbox-checkout-client.js',import.meta.url),'utf8');
const server=readFileSync(new URL('../docs/SANDBOX_CHECKOUT_DEPLOYMENT.md',import.meta.url),'utf8');
test('sandbox client contains no server secrets',()=>{
 assert.doesNotMatch(client,/sk_(test|live)_[A-Za-z0-9]+/);
 assert.doesNotMatch(client,/service_role|SUPABASE_SERVICE_ROLE_KEY/);
});
test('sandbox client validates products and checkout host',()=>{
 assert.match(client,/VALID_SKUS/);
 assert.match(client,/checkout\.stripe\.com/);
 assert.match(client,/response\.ok/);
});
test('checkout deployment is explicitly sandbox-only',()=>{
 assert.match(server,/NORTHSTAR_STRIPE_TEST_SECRET_KEY/);
 assert.match(server,/no live-key support/i);
});
