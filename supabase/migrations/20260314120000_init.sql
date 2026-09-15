-- Vivaboss Fusion — initial schema
-- profiles · categories · site_settings

create extension if not exists "pgcrypto";

-- ─── helpers ────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create type public.profile_role as enum ('admin', 'customer');

-- ─── profiles ───────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role public.profile_role not null default 'customer',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Avoid RLS recursion when policies check admin role
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    -- Allow SQL editor / service role (no JWT); block non-admin users
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Only admins can change profile roles';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
before update on public.profiles
for each row execute function public.protect_profile_role();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── categories ─────────────────────────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

create policy "Public can read visible categories"
  on public.categories for select
  to anon, authenticated
  using (is_visible = true);

create policy "Admins can read all categories"
  on public.categories for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert categories"
  on public.categories for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update categories"
  on public.categories for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete categories"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

insert into public.categories (slug, name, description, sort_order) values
  ('fashion', 'Fashion & Accessories', 'Handmade leather, shoes, and modern African-inspired style.', 1),
  ('personalised', 'Personalised Gifts', 'Engraving, custom tags, memorial and anniversary pieces.', 2),
  ('smart-home', 'Smart Home', 'Locks, cameras, lighting, sensors — ready for UK homes.', 3),
  ('home-diy', 'Home & DIY', 'Equipment and essentials for home improvement.', 4);

-- ─── site_settings ──────────────────────────────────────────
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete site settings"
  on public.site_settings for delete
  to authenticated
  using (public.is_admin());

insert into public.site_settings (key, value) values
  (
    'contact',
    '{
      "phone": "+44 0000 000000",
      "whatsapp": "+440000000000",
      "email": "hello@vivabossfusion.co.uk",
      "address": "United Kingdom"
    }'::jsonb
  ),
  (
    'brand',
    '{
      "name": "Vivaboss Fusion Services",
      "shortName": "Vivaboss",
      "tagline": "Craftsmanship that turns heads. Style that holds attention.",
      "homepageLine": "Craft. Home. Delivery."
    }'::jsonb
  ),
  (
    'shipping',
    '{
      "ukWide": true,
      "defaultRateGbp": null,
      "freeOverGbp": null,
      "collectionEnabled": false
    }'::jsonb
  ),
  (
    'notifications',
    '{
      "adminEmails": ["hello@vivabossfusion.co.uk"],
      "emailOnOrder": true,
      "emailOnServiceJob": true,
      "emailOnCourierJob": true,
      "emailOnCustomRequest": true
    }'::jsonb
  );
