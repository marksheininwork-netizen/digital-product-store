import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const checkout=await readFile(new URL('../supabase/functions/northstar-live-checkout/index.ts',import.meta.url),'utf8');
const webhook=await readFile(new URL('../supabase/functions/northstar-live-webhook/index.ts',import.meta.url),'utf8');
const downloads=await readFile(new URL('../supabase/functions/northstar-private-downloads/index.ts',import.meta.url),'utf8');
const migration=await readFile(new URL('../supabase/migrations/20261102225132_northstar_payment_mode_isolation.sql',import.meta.url),'utf8');

test('live checkout stays closed until the explicit launch switch and live key are configured',()=>{
  const flag=checkout.indexOf('NORTHSTAR_LIVE_CHECKOUT_ENABLED')<checkout.indexOf('https://api.stripe.com/v1/checkout/sessions');
  assert.ok(flag,'the purchase switch must be checked before creating a Stripe session');
  assert.match(checkout,/const LIVE_SALES_RELEASED = false/);
  assert.match(checkout,/key\.startsWith\("sk_live_"\)/);
  assert.match(checkout,/data\.livemode !== true/);
});

test('live storefront can only create one-time purchases for mapped digital goods',()=>{
  assert.match(checkout,/mode: "payment"/);
  assert.match(checkout,/consent_collection\[terms_of_service\].*required/);
  assert.match(checkout,/NORTHSTAR_LIVE_PRICE_EMAILS/);
  assert.match(checkout,/NORTHSTAR_LIVE_PRICE_CLEANING/);
  assert.match(checkout,/NORTHSTAR_LIVE_PRICE_NICHE/);
  assert.doesNotMatch(checkout,/toolbox|subscription/i);
  assert.doesNotMatch(checkout,/price_1[A-Za-z0-9]+/,'live price ids must stay out of the checkout source');
});

test('live webhook verifies a live signature and records only validated paid sessions',()=>{
  assert.match(webhook,/stripe-signature/);
  assert.match(webhook,/verifySignature\(raw/);
  assert.match(webhook,/event\.livemode !== true/);
  assert.match(webhook,/key\.startsWith\("sk_live_"\)/);
  assert.match(webhook,/payment_status !== "paid"/);
  assert.match(webhook,/northstar_record_live_paid_checkout/);
  assert.match(webhook,/northstar_record_live_payment_reversal/);
  assert.match(webhook,/NORTHSTAR_LIVE_PRICE_EMAILS/);
  assert.match(webhook,/NORTHSTAR_LIVE_PRICE_CLEANING/);
  assert.match(webhook,/NORTHSTAR_LIVE_PRICE_NICHE/);
  assert.doesNotMatch(webhook,/northstar_record_membership/);
});

test('order records and server-only RPCs preserve sandbox/live separation',()=>{
  assert.match(migration,/add column if not exists livemode boolean not null default false/i);
  assert.match(migration,/values \(p_session_id, p_payment_intent, lower\(p_email\), p_amount, p_currency, 'paid', true\)/);
  assert.match(migration,/where stripe_payment_intent_id = p_payment_intent and livemode = true/i);
  assert.match(migration,/revoke all on function public\.northstar_record_live_paid_checkout[^;]+ from public, anon, authenticated/i);
  assert.match(migration,/grant execute on function public\.northstar_record_live_paid_checkout[^;]+ to service_role/i);
  assert.match(downloads,/livemode: order\.livemode === true/);
});
