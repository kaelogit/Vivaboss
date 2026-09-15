-- Vivaboss Fusion — service jobs + courier jobs

create type public.service_job_type as enum (
  'home_repair',
  'smart_home_install',
  'other'
);

create type public.service_job_status as enum (
  'new',
  'contacted',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

create type public.service_job_source as enum (
  'website',
  'checkout_addon',
  'admin'
);

create type public.courier_vertical as enum (
  'medical',
  'flowers_events',
  'legal',
  'general'
);

create type public.courier_urgency as enum (
  'standard',
  'same_day',
  'urgent'
);

create type public.courier_job_status as enum (
  'new',
  'confirmed',
  'picked_up',
  'delivered',
  'failed',
  'cancelled'
);

create table public.service_jobs (
  id uuid primary key default gen_random_uuid(),
  status public.service_job_status not null default 'new',
  job_type public.service_job_type not null default 'home_repair',
  specific_service text,
  description text,
  photos text[] not null default '{}',
  address_line1 text,
  address_line2 text,
  city text,
  postcode text not null,
  preferred_window text,
  full_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  source public.service_job_source not null default 'website',
  related_order_id uuid references public.orders (id) on delete set null,
  internal_notes text,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_jobs_status_idx on public.service_jobs (status);
create index service_jobs_created_at_idx on public.service_jobs (created_at desc);
create index service_jobs_email_idx on public.service_jobs (email);

create trigger service_jobs_set_updated_at
before update on public.service_jobs
for each row execute function public.set_updated_at();

create table public.courier_jobs (
  id uuid primary key default gen_random_uuid(),
  status public.courier_job_status not null default 'new',
  vertical public.courier_vertical not null default 'general',
  urgency public.courier_urgency not null default 'standard',
  item_description text not null,
  notes text,
  photos text[] not null default '{}',
  pickup_line1 text not null,
  pickup_line2 text,
  pickup_city text,
  pickup_postcode text not null,
  dropoff_line1 text not null,
  dropoff_line2 text,
  dropoff_city text,
  dropoff_postcode text not null,
  preferred_window text,
  full_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courier_jobs_status_idx on public.courier_jobs (status);
create index courier_jobs_created_at_idx on public.courier_jobs (created_at desc);
create index courier_jobs_email_idx on public.courier_jobs (email);

create trigger courier_jobs_set_updated_at
before update on public.courier_jobs
for each row execute function public.set_updated_at();

alter table public.service_jobs enable row level security;
alter table public.courier_jobs enable row level security;

create policy "Admins can read service jobs"
  on public.service_jobs for select to authenticated
  using (public.is_admin());

create policy "Admins can update service jobs"
  on public.service_jobs for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read courier jobs"
  on public.courier_jobs for select to authenticated
  using (public.is_admin());

create policy "Admins can update courier jobs"
  on public.courier_jobs for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Inserts go through service role API (no public insert policies)
