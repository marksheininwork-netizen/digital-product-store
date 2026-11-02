-- Isolate production sales from Stripe sandbox records without changing
-- existing test-mode orders. Existing records default to livemode=false.
alter table public.northstar_orders
  add column if not exists livemode boolean not null default false;

alter table public.northstar_stripe_events
  add column if not exists livemode boolean not null default false;

alter table public.northstar_memberships
  add column if not exists livemode boolean not null default false;

-- The live webhook has a separate, service-role-only fulfillment RPC. Keep the
-- existing sandbox RPC signatures intact so the test webhook stays isolated.
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
begin
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
  values (p_session_id, p_payment_intent, lower(p_email), p_amount, p_currency, 'paid', true)
  on conflict (stripe_checkout_session_id) do update
    set payment_status = 'paid', updated_at = now()
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
  if p_status not in ('refunded', 'disputed') then
    raise exception 'Invalid reversal';
  end if;

  insert into public.northstar_stripe_events(event_id, event_type, livemode)
  values (p_event_id, p_status, true)
  on conflict do nothing;
  if not found then
    return false;
  end if;

  update public.northstar_orders
  set payment_status = p_status, updated_at = now()
  where stripe_payment_intent_id = p_payment_intent and livemode = true;

  if not found then
    raise exception 'Live order not found';
  end if;
  return true;
end;
$function$;

revoke all on function public.northstar_record_live_paid_checkout(text,text,text,bigint,text,text,text,text) from public, anon, authenticated;
grant execute on function public.northstar_record_live_paid_checkout(text,text,text,bigint,text,text,text,text) to service_role;

revoke all on function public.northstar_record_live_payment_reversal(text,text,text) from public, anon, authenticated;
grant execute on function public.northstar_record_live_payment_reversal(text,text,text) to service_role;
