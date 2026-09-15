-- Vivaboss Fusion — inventory ledger + order inventory flag

alter table public.orders
  add column if not exists inventory_applied boolean not null default false;

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  delta integer not null,
  reason text not null,
  order_id uuid references public.orders (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists inventory_movements_product_id_idx
  on public.inventory_movements (product_id);

alter table public.inventory_movements enable row level security;

create policy "Admins can read inventory movements"
  on public.inventory_movements for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert inventory movements"
  on public.inventory_movements for insert
  to authenticated
  with check (public.is_admin());
