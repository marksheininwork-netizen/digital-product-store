import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./stripe-test-store.html',import.meta.url),'utf8');
const client=readFileSync(new URL('./stripe-test-store.js',import.meta.url),'utf8');
test('four unique sandbox SKUs are connected to checkout client',()=>{
 const skus=[...html.matchAll(/data-sku="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(skus,['focus','launch','creator','membership']);
 assert.match(html,/src="\.\/stripe-test-store\.js"/);
});
test('store does not bypass checkout backend via static payment links',()=>{
 assert.doesNotMatch(html,/href="https:\/\/buy\.stripe\.com\//);
 assert.match(client,/northstar-sandbox-checkout/);
 assert.match(client,/method:'POST'/);
});
test('checkout client validates HTTPS Stripe destination and handles errors',()=>{
 assert.match(client,/destination\.protocol!=='https:'/);
 assert.match(client,/destination\.hostname/);
 assert.match(client,/response\.ok/);
 assert.match(client,/removeAttribute\('aria-disabled'\)/);
});
