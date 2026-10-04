-- Shop order fulfillment: delivery or click & pick up
alter table public.orders
  add column if not exists fulfillment_method text not null default 'delivery'
  check (fulfillment_method in ('delivery', 'collection'));

comment on column public.orders.fulfillment_method is
  'delivery = ship to customer; collection = customer pickup';

-- Turn on click & pick up and set a pick-up address if missing
update public.site_settings
set
  value =
    jsonb_set(
      jsonb_set(
        coalesce(value, '{}'::jsonb),
        '{collectionEnabled}',
        'true'::jsonb
      ),
      '{collectionAddress}',
      to_jsonb(
        coalesce(
          nullif(trim(coalesce(value->>'collectionAddress', '')), ''),
          '134 Clifton Road, Darlington DL1 5DY'
        )
      )
    ),
  updated_at = now()
where key = 'shipping';
