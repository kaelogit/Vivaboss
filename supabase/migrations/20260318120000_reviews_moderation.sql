-- New public reviews stay hidden until an admin approves them.
alter table public.reviews
  alter column is_published set default false;
