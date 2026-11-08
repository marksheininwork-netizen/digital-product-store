import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../supabase/migrations/20261108_northstar_reversal_ordering.sql', import.meta.url), 'utf8');

test('reversal events are durable before orders arrive', () => {
  assert.match(sql, /create table if not exists public\.northstar_payment_reversals/);
  assert.match(sql, /stripe_payment_intent_id text primary key/);
  assert.match(sql, /insert into public\.northstar_payment_reversals/);
  assert.match(sql, /coalesce\(v_status,'paid'\)/);
});
test('paid checkout and reversal updates serialize per payment intent', () => {
  const matches = sql.match(/pg_advisory_xact_lock\(pg_catalog\.hashtextextended\(p_payment_intent, 0\)\)/g) || [];
  assert.equal(matches.length, 2);
  assert.match(sql, /when public\.northstar_orders\.payment_status in \('refunded','disputed'\)/);
});
test('payment RPCs are service-only and reversal table has RLS', () => {
  assert.match(sql, /alter table public\.northstar_payment_reversals enable row level security/);
  assert.match(sql, /revoke all on public\.northstar_payment_reversals from anon, authenticated/);
  assert.match(sql, /revoke all on function public\.northstar_record_paid_checkout[\s\S]*from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.northstar_record_payment_reversal[\s\S]*to service_role/);
});
