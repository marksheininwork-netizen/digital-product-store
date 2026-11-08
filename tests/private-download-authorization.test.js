import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../supabase/functions/northstar-private-downloads/index.ts', import.meta.url), 'utf8');
test('private downloads require authenticated confirmed email', () => {
  assert.match(source, /authorization/);
  assert.match(source, /\/auth\/v1\/user/);
  assert.match(source, /email_confirmed_at/);
  assert.match(source, /buyer_email/);
  assert.match(source, /eq\.paid/);
});
test('file authorization requires both purchased order and exact storage path', () => {
  assert.match(source, /item\.order_id === orderId && item\.path === file/);
  assert.match(source, /No purchase for this file/);
  assert.match(source, /northstar-private-products/);
  assert.match(source, /expiresIn: 60/);
  assert.match(source, /cache-control/);
});
