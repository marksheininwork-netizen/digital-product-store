create or replace function public.northstar_record_payment_reversal(
  p_event_id text,
  p_payment_intent text,
  p_status text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('refunded','disputed') then raise exception 'Invalid reversal'; end if;

  insert into public.northstar_stripe_events(event_id,event_type)
  values(p_event_id,p_status)
  on conflict do nothing;
  if not found then return false; end if;

  update public.northstar_orders
  set payment_status=p_status,updated_at=now()
  where stripe_payment_intent_id=p_payment_intent;
  if not found then raise exception 'Order not found'; end if;
  return true;
end
$$;

revoke all on function public.northstar_record_payment_reversal(text,text,text)
  from public,anon,authenticated;
grant execute on function public.northstar_record_payment_reversal(text,text,text)
  to service_role;
