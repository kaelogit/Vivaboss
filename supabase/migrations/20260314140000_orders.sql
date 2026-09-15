-- Vivaboss Fusion — orders, custom requests, customer uploads

create type public.order_status as enum (
  'pending_payment',
  'paid',
  'processing',
  'personalising',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type public.custom_request_status as enum (
  'new',
  'reviewing',
  'quoted',
  'accepted',
  'declined',
  'converted_to_order'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status public.order_status not null default 'pending_payment',
  email text not null,
  phone text,
  full_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  postcode text not null,
  country text not null default 'GB',
  subtotal_gbp numeric(10, 2) not null default 0,
  shipping_gbp numeric(10, 2) not null default 0,
  total_gbp numeric(10, 2) not null default 0,
  currency text not null default 'gbp',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  notes text,
  internal_notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_idx on public.orders (status);
create index orders_email_idx on public.orders (email);
create index orders_created_at_idx on public.orders (created_at desc);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_slug text,
  unit_price_gbp numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  line_total_gbp numeric(10, 2) not null,
  image_url text,
  customisation jsonb not null default '{}'::jsonb,
  installation_requested boolean not null default false,
  installation_price_gbp numeric(10, 2),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);

create table public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  status public.custom_request_status not null default 'new',
  product_id uuid references public.products (id) on delete set null,
  product_name text,
  full_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  message text,
  preferred_material text,
  instructions text,
  uploads text[] not null default '{}',
  field_snapshot jsonb not null default '{}'::jsonb,
  quote_amount_gbp numeric(10, 2),
  quote_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index custom_requests_status_idx on public.custom_requests (status);

create trigger custom_requests_set_updated_at
before update on public.custom_requests
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.custom_requests enable row level security;

-- Public cannot read orders; service role / admin only
create policy "Admins can read orders"
  on public.orders for select to authenticated
  using (public.is_admin());

create policy "Admins can update orders"
  on public.orders for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read order items"
  on public.order_items for select to authenticated
  using (public.is_admin());

create policy "Admins can read custom requests"
  on public.custom_requests for select to authenticated
  using (public.is_admin());

create policy "Admins can update custom requests"
  on public.custom_requests for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Inserts go through service role in API routes (bypasses RLS)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'customer-uploads',
  'customer-uploads',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Admins read customer uploads"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'customer-uploads' and public.is_admin());
