# Supabase setup — Vivaboss Fusion

Connect a Supabase project, run the migration, create an admin user. Until then, local **admin preview** works with `ALLOW_ADMIN_PREVIEW=true`.

## 1. Create the project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** — name e.g. `vivaboss-fusion`, region close to the UK (e.g. London / Frankfurt)
3. Save the database password

## 2. Copy API keys

**Project Settings → API**

| Env var | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (server only — never expose to the browser) |

Put them in `.env.local` (see `.env.example`). Remove or set `ALLOW_ADMIN_PREVIEW=false` once auth works.

## 3. Run migrations

**SQL Editor → New query** — run these in order:

1. `supabase/migrations/20260314120000_init.sql`  
2. `supabase/migrations/20260314130000_products.sql`  
3. `supabase/migrations/20260314140000_orders.sql`  
4. `supabase/migrations/20260314150000_inventory.sql`  
5. `supabase/migrations/20260314160000_bookings.sql`  
6. `supabase/migrations/20260315120000_reviews.sql`
7. `supabase/migrations/20260316120000_preorder.sql`

## 3b. Load the demo catalogue + ops data (recommended)

Run **`supabase/seed_demo.sql`** once migrations are done.

It fills:

- **25 products** across Fashion / Personalised / Smart Home / Home & DIY (with marketing images)
- Custom fields on personalisable products
- Sample **orders**, **custom requests**, **service jobs**, **courier jobs**, **reviews**
- Editable **homepage / FAQ / pages / shipping / contact** settings

Re-run safe: products upsert by slug; demo ops rows use `@demo.vivabossfusion.co.uk` and get replaced.

Then open `/shop` and `/admin` to edit everything.

## 4. Create your admin user

1. **Authentication → Users → Add user**
2. Email + password (use a real operator email)
3. Open **SQL Editor** and promote them:

```sql
update public.profiles
set role = 'admin'
where email = lower(trim('you@example.com'));
```

Or edit `supabase/seed_admin.sql` and run that.

Confirm:

```sql
select id, email, role from public.profiles;
```

## 5. Sign in

1. `npm run dev`
2. Open `/admin/login`
3. Sign in with the user you created

If you see **forbidden**, the session exists but `profiles.role` is not `admin`.

## 6. Vercel

Add the same three env vars (plus Stripe/Resend later) in the Vercel project settings. Redeploy.

## What Steps 3–4 created

| Piece | Purpose |
|---|---|
| `profiles` | Auth user ↔ `admin` / `customer` role |
| `categories` | Seeded Fashion / Personalised / Smart Home / Home & DIY |
| `site_settings` | Contact, brand, shipping, notifications JSON |
| `products` + `product_custom_fields` | Catalogue + personalisation config |
| `product-media` | Public storage bucket for product images |
| `is_admin()` | Safe RLS helper (no recursion) |
| Middleware | Refreshes auth cookies |
| Admin gate | `/admin/*` requires admin profile (or preview flag) |

## Migrations (run in order)

1. `20260314120000_init.sql`  
2. `20260314130000_products.sql`  
3. `20260314140000_orders.sql`  
4. `20260314150000_inventory.sql`  
5. `20260314160000_bookings.sql` — service_jobs + courier_jobs  

Set `RESEND_API_KEY` (required for any email). Admin inbox is always **admin@vivabossfusion.co.uk** — see `docs/EMAIL.md`.

## Next

Step 9 continues: CMS when client assets land; Privacy/Terms lawyer copy before go-live.
