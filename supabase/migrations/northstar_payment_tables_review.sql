-- Run only after reviewing against the existing Northstar schema.
-- This migration is additive and does not change existing order records.
create table if not exists public.northstar_stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);
alter table public.northstar_stripe_events enable row level security;
revoke all on public.northstar_stripe_events from anon, authenticated;

create table if not exists public.northstar_memberships (
  stripe_subscription_id text primary key,
  stripe_customer_id text,
  buyer_email text,
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.northstar_memberships enable row level security;
revoke all on public.northstar_memberships from anon, authenticated;
