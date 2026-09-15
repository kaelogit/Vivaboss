-- Vivaboss Fusion — products, custom fields, product media storage

create type public.product_status as enum ('draft', 'active', 'archived');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  price_gbp numeric(10, 2) not null default 0 check (price_gbp >= 0),
  compare_at_gbp numeric(10, 2) check (compare_at_gbp is null or compare_at_gbp >= 0),
  cost_gbp numeric(10, 2) check (cost_gbp is null or cost_gbp >= 0),
  images text[] not null default '{}',
  status public.product_status not null default 'draft',
  is_customisable boolean not null default false,
  requires_approval boolean not null default false,
  offers_installation boolean not null default false,
  installation_service_key text,
  installation_price_gbp numeric(10, 2),
  track_stock boolean not null default true,
  stock_quantity integer,
  low_stock_threshold integer not null default 5,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_status_idx on public.products (status);
create index products_slug_idx on public.products (slug);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create table public.product_custom_fields (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  key text not null,
  field_type text not null check (
    field_type in ('text', 'textarea', 'select', 'colour', 'number', 'file')
  ),
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, key)
);

create index product_custom_fields_product_id_idx
  on public.product_custom_fields (product_id);

alter table public.products enable row level security;
alter table public.product_custom_fields enable row level security;

-- Public: active products only
create policy "Public can read active products"
  on public.products for select
  to anon, authenticated
  using (status = 'active');

create policy "Admins can read all products"
  on public.products for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- Custom fields follow product visibility
create policy "Public can read custom fields for active products"
  on public.product_custom_fields for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'active'
    )
  );

create policy "Admins can read all custom fields"
  on public.product_custom_fields for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert custom fields"
  on public.product_custom_fields for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update custom fields"
  on public.product_custom_fields for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete custom fields"
  on public.product_custom_fields for delete
  to authenticated
  using (public.is_admin());

-- Storage bucket for product images (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Public read product media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-media');

create policy "Admins upload product media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-media' and public.is_admin());

create policy "Admins update product media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-media' and public.is_admin())
  with check (bucket_id = 'product-media' and public.is_admin());

create policy "Admins delete product media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-media' and public.is_admin());

-- Demo products (linked to seeded categories) — replace with real catalogue later
insert into public.products (
  category_id, name, slug, short_description, description,
  price_gbp, compare_at_gbp, images, status,
  is_customisable, requires_approval, offers_installation,
  installation_service_key, installation_price_gbp,
  track_stock, stock_quantity
)
select
  c.id,
  v.name,
  v.slug,
  v.short_description,
  v.description,
  v.price_gbp,
  v.compare_at_gbp,
  '{}'::text[],
  'active'::public.product_status,
  v.is_customisable,
  v.requires_approval,
  v.offers_installation,
  v.installation_service_key,
  v.installation_price_gbp,
  true,
  v.stock_quantity
from public.categories c
join (
  values
    (
      'fashion',
      'Handmade Leather Tote',
      'handmade-leather-tote',
      'Crafted leather tote with durable stitching.',
      'A everyday-luxury tote inspired by African craft and modern lines. Made to look good, feel special, and last.',
      120.00,
      null::numeric,
      false,
      false,
      false,
      null::text,
      null::numeric,
      8
    ),
    (
      'fashion',
      'Custom Leather Keyholder',
      'custom-leather-keyholder',
      'Make it yours — name, initials or message.',
      'Personalised leather keyholder. Choose colour, add your text, and we craft it with care.',
      25.00,
      null::numeric,
      true,
      false,
      false,
      null::text,
      null::numeric,
      40
    ),
    (
      'personalised',
      'Custom Photo Wood Engraving',
      'custom-photo-wood-engraving',
      'Turn a favourite photo into engraved wood.',
      'Upload your photo, choose a size, and optionally add a message. Ready-to-order personalisation.',
      45.00,
      null::numeric,
      true,
      false,
      false,
      null::text,
      null::numeric,
      25
    ),
    (
      'personalised',
      'Portrait Engraving on Metal',
      'portrait-engraving-metal',
      'Complex portrait work — request a custom quote.',
      'For detailed portrait engraving we review your image first, then confirm design and price before production.',
      0.00,
      null::numeric,
      true,
      true,
      false,
      null::text,
      null::numeric,
      null::int
    ),
    (
      'smart-home',
      'Smart Door Lock',
      'smart-door-lock',
      'Keyless entry for a safer home.',
      'Modern smart lock ready for UK homes. Add professional installation at checkout if you want us to fit it.',
      189.00,
      219.00,
      false,
      false,
      true,
      'smart-home',
      75.00,
      15
    ),
    (
      'smart-home',
      'Security Camera Kit',
      'security-camera-kit',
      'Clear monitoring with simple setup.',
      'A reliable camera kit for homes and small businesses. Optional Vivaboss installation available.',
      149.00,
      null::numeric,
      false,
      false,
      true,
      'smart-home',
      90.00,
      12
    ),
    (
      'home-diy',
      'Wall Shelf Fixing Kit',
      'wall-shelf-fixing-kit',
      'Essentials for clean shelf installs.',
      'Quality fixings for shelves and light wall-mounted furniture. Pair with our home installation service if needed.',
      18.00,
      null::numeric,
      false,
      false,
      false,
      null::text,
      null::numeric,
      50
    )
) as v(
  category_slug, name, slug, short_description, description,
  price_gbp, compare_at_gbp, is_customisable, requires_approval,
  offers_installation, installation_service_key, installation_price_gbp, stock_quantity
)
on c.slug = v.category_slug
on conflict (slug) do nothing;

-- Custom fields for demo personalised products
insert into public.product_custom_fields (product_id, label, key, field_type, required, options, sort_order)
select p.id, f.label, f.key, f.field_type, f.required, f.options::jsonb, f.sort_order
from public.products p
join (
  values
    ('custom-leather-keyholder', 'Leather colour', 'colour', 'select', true,
     '[{"label":"Black","value":"black"},{"label":"Tan","value":"tan"},{"label":"Burgundy","value":"burgundy"}]', 1),
    ('custom-leather-keyholder', 'Name / message', 'message', 'text', true, '[]', 2),
    ('custom-leather-keyholder', 'Engraving style', 'style', 'select', false,
     '[{"label":"Block","value":"block"},{"label":"Script","value":"script"}]', 3),
    ('custom-photo-wood-engraving', 'Size', 'size', 'select', true,
     '[{"label":"Small","value":"small","price_delta_gbp":0},{"label":"Medium","value":"medium","price_delta_gbp":10},{"label":"Large","value":"large","price_delta_gbp":25}]', 1),
    ('custom-photo-wood-engraving', 'Upload photo', 'photo', 'file', true, '[]', 2),
    ('custom-photo-wood-engraving', 'Message (optional)', 'message', 'textarea', false, '[]', 3),
    ('portrait-engraving-metal', 'Upload reference image', 'photo', 'file', true, '[]', 1),
    ('portrait-engraving-metal', 'Preferred material', 'material', 'text', false, '[]', 2),
    ('portrait-engraving-metal', 'Additional instructions', 'notes', 'textarea', false, '[]', 3)
) as f(product_slug, label, key, field_type, required, options, sort_order)
  on p.slug = f.product_slug
on conflict (product_id, key) do nothing;
