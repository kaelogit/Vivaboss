-- Extra admin controls for preview zones.
-- Safe if 20260924220000 was already applied without these columns.

alter table public.product_custom_fields
  add column if not exists preview_caption text,
  add column if not exists max_length integer,
  add column if not exists preview_ink text not null default 'light',
  add column if not exists preview_fit text not null default 'cover';
