-- After creating your Auth user in Supabase Dashboard:
-- 1. Authentication → Users → Add user (email + password)
-- 2. Run this with that user's UUID (Authentication → Users → copy id)
--
-- Example:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- Or by id:
--   update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000000';

-- Prefer email once the trigger has created the profile row:
update public.profiles
set role = 'admin'
where email = lower(trim('REPLACE_WITH_ADMIN_EMAIL'));

-- Also run (in order):
--   1) all files in supabase/migrations/
--   2) supabase/seed_demo.sql   ← big catalogue + orders/jobs/reviews/CMS
--   3) this file (seed_admin.sql) after creating your Auth user
--
-- Reviews table: supabase/migrations/20260315120000_reviews.sql
-- (must exist before seed_demo.sql inserts reviews)
