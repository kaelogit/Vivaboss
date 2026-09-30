-- Each preview zone can sit on its own product photo, with a font and size.
-- Safe if an earlier preview migration already ran.

alter table public.product_custom_fields
  add column if not exists preview_image_index integer not null default 0,
  add column if not exists preview_font text not null default 'sans',
  add column if not exists preview_size text not null default 'md';
