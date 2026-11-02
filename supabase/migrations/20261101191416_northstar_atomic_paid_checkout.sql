create or replace function public.northstar_record_paid_checkout(
  p_event_id text,
  p_session_id text,
  p_email text,
  p_amount bigint,
  p_currency text,
  p_payment_intent text,
  p_price text,
  p_file text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.northstar_stripe_events(event_id,event_type)
  values(p_event_id,'checkout.paid')
  on conflict do nothing;
  if not found then return false; end if;

  insert into public.northstar_orders(
    stripe_checkout_session_id,stripe_payment_intent_id,buyer_email,
    amount_total,currency,payment_status
  )
  values(p_session_id,p_payment_intent,lower(p_email),p_amount,p_currency,'paid')
  on conflict(stripe_checkout_session_id) do update
    set payment_status='paid',updated_at=now()
  returning id into v_id;

  if not exists(
    select 1 from public.northstar_order_items
    where order_id=v_id and stripe_price_id=p_price
  ) then
    insert into public.northstar_order_items(order_id,stripe_price_id,storage_object_path)
    values(v_id,p_price,p_file);
  end if;
  return true;
end
$$;

revoke all on function public.northstar_record_paid_checkout(text,text,text,bigint,text,text,text,text)
  from public,anon,authenticated;
grant execute on function public.northstar_record_paid_checkout(text,text,text,bigint,text,text,text,text)
  to service_role;
