-- Optional photo on customer reviews (public optimized WebP in review-media)
alter table public.reviews
  add column if not exists image_path text;

comment on column public.reviews.image_path is
  'Storage path in review-media bucket (optimized WebP)';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-media',
  'review-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Public read review media" on storage.objects;
create policy "Public read review media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'review-media');