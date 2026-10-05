-- Per-service reviews (Home services / Smart home)
alter table public.reviews
  add column if not exists service_type text
  check (
    service_type is null
    or service_type in ('home_repair', 'smart_home_install')
  );

comment on column public.reviews.service_type is
  'home_repair | smart_home_install when review is for a service arm; null for site or product reviews';

create index if not exists reviews_service_type_idx
  on public.reviews (service_type)
  where service_type is not null;
