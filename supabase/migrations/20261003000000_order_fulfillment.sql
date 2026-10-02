-- Shop order fulfillment: delivery or click & collect
alter table public.orders
  add column if not exists fulfillment_method text not null default 'delivery'
  check (fulfillment_method in ('delivery', 'collection'));

comment on column public.orders.fulfillment_method is
  'delivery = ship to customer; collection = customer pickup';

-- Turn on click & collect in shipping settings (checkout toggle)
update public.site_settings
set
  value = jsonb_set(
    coalesce(value, '{}'::jsonb),
    '{collectionEnabled}',
    'true'::jsonb
  ),
  updated_at = now()
where key = 'shipping';
