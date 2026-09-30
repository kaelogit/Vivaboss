-- Optional numbered preview zones on a product photo.
-- Admin chooses which questions appear, and where, on the image.

alter table public.products
  add column if not exists preview_image_index integer not null default 0;

alter table public.product_custom_fields
  add column if not exists show_on_preview boolean not null default false,
  add column if not exists preview_x numeric(6, 2),
  add column if not exists preview_y numeric(6, 2),
  add column if not exists preview_w numeric(6, 2),
  add column if not exists preview_h numeric(6, 2),
  add column if not exists preview_caption text,
  add column if not exists max_length integer,
  add column if not exists preview_ink text not null default 'light',
  add column if not exists preview_fit text not null default 'cover',
  add column if not exists preview_image_index integer not null default 0,
  add column if not exists preview_font text not null default 'sans',
  add column if not exists preview_size text not null default 'md';
