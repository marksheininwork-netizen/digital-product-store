create or replace function public.northstar_record_membership(
  p_event_id text,
  p_subscription_id text,
  p_customer_id text,
  p_email text,
  p_status text,
  p_period_end bigint
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.northstar_stripe_events(event_id,event_type)
  values(p_event_id,'subscription.changed')
  on conflict do nothing;
  if not found then return false; end if;

  insert into public.northstar_memberships(
    stripe_subscription_id,stripe_customer_id,buyer_email,status,current_period_end
  )
  values(
    p_subscription_id,p_customer_id,lower(p_email),p_status,to_timestamp(p_period_end)
  )
  on conflict(stripe_subscription_id) do update
    set stripe_customer_id=excluded.stripe_customer_id,
        buyer_email=coalesce(excluded.buyer_email,public.northstar_memberships.buyer_email),
        status=excluded.status,
        current_period_end=excluded.current_period_end,
        updated_at=now();
  return true;
end
$$;

revoke all on function public.northstar_record_membership(text,text,text,text,text,bigint)
  from public,anon,authenticated;
grant execute on function public.northstar_record_membership(text,text,text,text,text,bigint)
  to service_role;
