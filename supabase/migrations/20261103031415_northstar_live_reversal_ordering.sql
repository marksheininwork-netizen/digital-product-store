-- Canonical migration applied through Supabase on 2026-11-03 UTC.
create table if not exists public.northstar_live_payment_reversals (
  stripe_payment_intent_id text primary key,
  payment_status text not null check (payment_status in ('refunded', 'disputed')),
  updated_at timestamptz not null default now()
);
alter table public.northstar_live_payment_reversals enable row level security;
revoke all on table public.northstar_live_payment_reversals from public, anon, authenticated;
grant select, insert, update on table public.northstar_live_payment_reversals to service_role;

-- Preserve already recorded reversals when introducing the durable ledger.
insert into public.northstar_live_payment_reversals(stripe_payment_intent_id, payment_status)
select stripe_payment_intent_id,
       case when bool_or(payment_status = 'refunded') then 'refunded' else 'disputed' end
from public.northstar_orders
where livemode = true and payment_status in ('refunded', 'disputed')
  and stripe_payment_intent_id ~ '^pi_[A-Za-z0-9]+$'
group by stripe_payment_intent_id
on conflict (stripe_payment_intent_id) do nothing;

create or replace function public.northstar_record_live_paid_checkout(
  p_event_id text,
  p_session_id text,
  p_email text,
  p_amount bigint,
  p_currency text,
  p_payment_intent text,
  p_price text,
  p_file text
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_id uuid;
  v_status text;
begin
  if p_payment_intent is null or p_payment_intent !~ '^pi_[A-Za-z0-9]+$' then
    raise exception 'Invalid payment reference';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('northstar-live:' || p_payment_intent, 0));
  select payment_status into v_status from public.northstar_live_payment_reversals
  where stripe_payment_intent_id = p_payment_intent;
  v_status := coalesce(v_status, 'paid');
  insert into public.northstar_stripe_events(event_id, event_type, livemode)
  values (p_event_id, 'checkout.paid', true)
  on conflict do nothing;
  if not found then
    return false;
  end if;

  insert into public.northstar_orders(
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    buyer_email,
    amount_total,
    currency,
    payment_status,
    livemode
  )
  values (p_session_id, p_payment_intent, lower(p_email), p_amount, p_currency, v_status, true)
  on conflict (stripe_checkout_session_id) do update
    set payment_status = case
      when public.northstar_orders.payment_status = 'refunded' then 'refunded'
      when excluded.payment_status = 'refunded' then 'refunded'
      when public.northstar_orders.payment_status = 'disputed' then 'disputed'
      else excluded.payment_status end,
      updated_at = now()
    where public.northstar_orders.livemode = true
  returning id into v_id;

  if v_id is null then
    raise exception 'Checkout session mode mismatch';
  end if;

  if not exists (
    select 1 from public.northstar_order_items
    where order_id = v_id and stripe_price_id = p_price
  ) then
    insert into public.northstar_order_items(order_id, stripe_price_id, storage_object_path)
    values (v_id, p_price, p_file);
  end if;

  return true;
end;
$function$;

create or replace function public.northstar_record_live_payment_reversal(
  p_event_id text,
  p_payment_intent text,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if p_status is null or p_status not in ('refunded', 'disputed') then
    raise exception 'Invalid reversal';
  end if;

  if p_payment_intent is null or p_payment_intent !~ '^pi_[A-Za-z0-9]+$' then
    raise exception 'Invalid payment reference';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('northstar-live:' || p_payment_intent, 0));

  insert into public.northstar_stripe_events(event_id, event_type, livemode)
  values (p_event_id, p_status, true)
  on conflict do nothing;
  if not found then
    return false;
  end if;

  -- Persist reversals even when Stripe delivers them before checkout completion.
  insert into public.northstar_live_payment_reversals(stripe_payment_intent_id, payment_status)
  values (p_payment_intent, p_status)
  on conflict (stripe_payment_intent_id) do update
    set payment_status = case
      when public.northstar_live_payment_reversals.payment_status = 'refunded' then 'refunded'
      else excluded.payment_status end,
      updated_at = now();

  update public.northstar_orders
  set payment_status = case when payment_status = 'refunded' then 'refunded' else p_status end,
      updated_at = now()
  where stripe_payment_intent_id = p_payment_intent and livemode = true;

  return true;
end;
$function$;

revoke all on function public.northstar_record_live_paid_checkout(text,text,text,bigint,text,text,text,text) from public, anon, authenticated;
grant execute on function public.northstar_record_live_paid_checkout(text,text,text,bigint,text,text,text,text) to service_role;

revoke all on function public.northstar_record_live_payment_reversal(text,text,text) from public, anon, authenticated;
grant execute on function public.northstar_record_live_payment_reversal(text,text,text) to service_role;
