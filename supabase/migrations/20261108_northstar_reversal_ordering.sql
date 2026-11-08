-- REVIEW REQUIRED: draft only. Do not apply until transaction-order tests pass.
-- Reversal tombstones protect against refunds/disputes arriving before checkout events.
create table if not exists public.northstar_payment_reversals (
  stripe_payment_intent_id text primary key,
  status text not null check (status in ('refunded','disputed')),
  updated_at timestamptz not null default now()
);
alter table public.northstar_payment_reversals enable row level security;
revoke all on public.northstar_payment_reversals from anon, authenticated;
grant select, insert, update on public.northstar_payment_reversals to service_role;

create or replace function public.northstar_record_payment_reversal(
  p_event_id text, p_payment_intent text, p_status text
) returns boolean language plpgsql security definer set search_path = ''
as $function$
begin
  if p_status not in ('refunded','disputed') or coalesce(p_payment_intent,'') = '' then
    raise exception 'Invalid reversal';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_payment_intent, 0));
  insert into public.northstar_stripe_events(event_id,event_type)
    values (p_event_id,p_status) on conflict do nothing;
  if not found then return false; end if;
  insert into public.northstar_payment_reversals(stripe_payment_intent_id,status)
    values (p_payment_intent,p_status)
    on conflict (stripe_payment_intent_id) do update
      set status = case when public.northstar_payment_reversals.status = 'disputed'
                        then 'disputed' else excluded.status end,
          updated_at = now();
  update public.northstar_orders o
    set payment_status = r.status, updated_at = now()
    from public.northstar_payment_reversals r
    where o.stripe_payment_intent_id = r.stripe_payment_intent_id
      and r.stripe_payment_intent_id = p_payment_intent;
  return true;
end
$function$;

create or replace function public.northstar_record_paid_checkout(
  p_event_id text, p_session_id text, p_email text, p_amount bigint,
  p_currency text, p_payment_intent text, p_price text, p_file text
) returns boolean language plpgsql security definer set search_path = ''
as $function$
declare v_id uuid; v_status text;
begin
  if coalesce(p_payment_intent,'') = '' then raise exception 'Payment intent required'; end if;
  -- Serialize checkout and reversal updates for the same payment intent.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_payment_intent, 0));
  insert into public.northstar_stripe_events(event_id,event_type)
    values(p_event_id,'checkout.paid') on conflict do nothing;
  if not found then return false; end if;
  select status into v_status from public.northstar_payment_reversals
    where stripe_payment_intent_id = p_payment_intent;
  insert into public.northstar_orders(
    stripe_checkout_session_id,stripe_payment_intent_id,buyer_email,
    amount_total,currency,payment_status
  ) values (
    p_session_id,p_payment_intent,lower(p_email),p_amount,p_currency,
    coalesce(v_status,'paid')
  )
  on conflict (stripe_checkout_session_id) do update
    set payment_status = case
      when public.northstar_orders.payment_status in ('refunded','disputed')
      then public.northstar_orders.payment_status
      else excluded.payment_status end,
      updated_at=now()
  returning id into v_id;
  if not exists(select 1 from public.northstar_order_items
    where order_id=v_id and stripe_price_id=p_price) then
    insert into public.northstar_order_items(order_id,stripe_price_id,storage_object_path)
      values(v_id,p_price,p_file);
  end if;
  return true;
end
$function$;
