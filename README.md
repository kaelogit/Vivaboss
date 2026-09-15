# Vivaboss Fusion

Umbrella brand site for **vivabossfusion.co.uk** — shop, home & smart services, and courier under one domain.

## Stack

Next.js · TypeScript · Tailwind · Supabase · Stripe (next) · Vercel

## Docs

| Doc | Purpose |
|---|---|
| [`docs/VIVABOSS_PLAN.md`](docs/VIVABOSS_PLAN.md) | A–Z build plan + progress |
| [`docs/ADMIN_PLAN.md`](docs/ADMIN_PLAN.md) | Admin IA |
| [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) | Project, migrations, admin user |
| [`docs/CONTENT_DEPTH.md`](docs/CONTENT_DEPTH.md) | Real-deal content standard (homepage, about, etc.) |

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

- Store: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)  
  (`ALLOW_ADMIN_PREVIEW=true` until Supabase auth is connected)

## Quality bar

More polished than T40 + Lee Lagos combined — design system, admin cleanliness, and storefront craft. Content pages must be full experiences at launch (see content depth doc).
