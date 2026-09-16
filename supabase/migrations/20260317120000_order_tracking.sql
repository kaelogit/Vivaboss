-- Order fulfilment: carrier tracking for shipped orders

alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists tracking_carrier text,
  add column if not exists tracking_url text,
  add column if not exists shipped_at timestamptz;
