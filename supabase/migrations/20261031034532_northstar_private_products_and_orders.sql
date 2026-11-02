create table if not exists public.northstar_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  buyer_email text,
  amount_total bigint,
  currency text,
  payment_status text not null check (payment_status in ('paid','unpaid','refunded','disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.northstar_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.northstar_orders(id) on delete cascade,
  stripe_price_id text not null,
  storage_object_path text not null,
  created_at timestamptz not null default now(),
  unique(order_id,stripe_price_id)
);

alter table public.northstar_orders enable row level security;
alter table public.northstar_order_items enable row level security;
revoke all on public.northstar_orders from anon,authenticated;
revoke all on public.northstar_order_items from anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('northstar-private-products','northstar-private-products',false,52428800,array['application/zip','text/plain','application/pdf'])
on conflict (id) do update set public=false;
