-- Customer reviews (public submit · admin delete)

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  body text not null,
  email text,
  product_id uuid references public.products (id) on delete set null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_published_created_idx
  on public.reviews (is_published, created_at desc);

create index reviews_product_idx on public.reviews (product_id);

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

-- Anyone can read published reviews
create policy "reviews_public_read_published"
on public.reviews for select
to anon, authenticated
using (is_published = true);

-- Inserts go through service role / API (no public insert policy)
-- Admins manage via service role in API routes

grant select on public.reviews to anon, authenticated;
grant all on public.reviews to service_role;
