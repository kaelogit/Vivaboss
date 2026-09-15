# Vivaboss Fusion Services — A–Z Build Plan

**Domain:** [vivabossfusion.co.uk](https://vivabossfusion.co.uk)  
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Supabase · Stripe · Resend · Vercel  
**Quality bar (non‑negotiable):** More **amazing, polished, beautiful, and clean** than **T40 + Lee Lagos combined**. Those repos are reference only — never the ceiling.  
**Inspired by:** T40 admin discipline + Lee Lagos storefront energy — **not a fork**; a new product that should clearly outclass both.  
**Go-live:** As soon as build is complete (no fixed calendar date)

---

## Quality north star

Vivaboss must feel like a premium umbrella brand site, not “another Next shop.”

| Dimension | Bar |
|---|---|
| **Beauty** | Distinct visual system, brand-first hero, intentional motion, real atmosphere — never generic AI template energy |
| **Cleanliness** | Ruthless hierarchy, whitespace, one job per section; no cluttered cards/pills/stat strips |
| **Craft** | Typography, spacing, image treatment, and micro-interactions at portfolio quality |
| **Admin** | Cleaner and calmer than T40 — faster to scan, clearer queues, zero visual noise |
| **Shop** | More memorable than Lee — stronger product storytelling, smoother PDP/custom flows, richer but quieter UX |
| **Trust** | UK service + courier feel as premium as the fashion arm; one brand voice throughout |
| **Perfection standard** | Ship only when a page would impress on a client walkthrough *and* a portfolio review |

**Litmus test before calling any screen “done”:**  
Would this still impress if T40 and Lee Lagos were open side-by-side? If not, raise it.

---

## 0. Locked decisions

| Topic | Decision |
|---|---|
| Architecture | One website, one domain, umbrella brand |
| Phase 1 scope | Full shop + all services + courier + full admin |
| Shop categories | Fashion · Personalised · Smart Home · Home & DIY — **all sell online** |
| Personalisation | Two flows: configure → cart, and request custom (approval) |
| Smart home | Sell hardware + optional installation (pre/post checkout) |
| Payments | Stripe only · GBP |
| Delivery | UK-wide (+ collection option if needed later) |
| VAT on site | No |
| Bookings | Form → admin queue + WhatsApp deep-link + email to admin |
| Service geography | Entire UK (postcode-aware UX) |
| Brand | Logo provided · invent colours · clean fonts (Montserrat + Lato family like T40/Lee) |
| Imagery | Placeholders until client assets arrive |
| Contact | Phone, WhatsApp, email, address (placeholders until real details) |
| Hosting | Vercel + Supabase |
| Repo | New project at `C:\Users\Kaelo\vivaboss-fusion` |

Companion docs:
- [`ADMIN_PLAN.md`](./ADMIN_PLAN.md) — full admin IA and modules  
- [`CONTENT_DEPTH.md`](./CONTENT_DEPTH.md) — **homepage, about, and all marketing pages must be real deals, not thin stubs**  
- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) — project + migrations

---

## 1. Brand & positioning

### 1.1 What Vivaboss is
An umbrella brand with four customer-facing arms:

1. **Shop** — products you buy  
2. **Home & Smart Services** — we come to you  
3. **Courier** — we move what matters  
4. **Brand story** — culture, craft, care  

### 1.2 Tagline system
- Primary: **Crafted with culture. Powered by creativity. Delivered with care.**  
- Fashion punchline: **People will stare. Make it worth their while.**  
- Homepage short: **Craft. Home. Delivery.**

### 1.3 Visual direction (invented — refine once logo is inspected)
- Avoid purple gradients, cream/serif terracotta, and generic “AI luxury” looks.  
- Direction: **warm craft meets modern UK service** — deep charcoal, warm off-white, one strong accent (e.g. copper / deep emerald / burnt umber — pick after logo review).  
- Typography: expressive heading + clean body (Montserrat + Lato or equivalent loaded via `next/font`).  
- Motion: 2–3 intentional homepage motions (hero entrance, section reveal, shop hover) — not noise.  
- Homepage composition: one hero composition, brand-first, full-bleed visual plane, no card clutter in hero.

---

## 2. Information architecture (public site)

```
vivabossfusion.co.uk
├── /                          Homepage — path chooser + highlights
├── /shop                      Multi-category store
│   ├── /shop/fashion
│   ├── /shop/personalised
│   ├── /shop/smart-home
│   └── /shop/home-diy
├── /product/[slug]            Product detail (standard | customisable | request)
├── /cart
├── /checkout                  Stripe
├── /order/success
├── /order/track
├── /services                  Services hub
│   ├── /services/home         Handyman / repairs / installs
│   ├── /services/smart-home   Setup & installation
│   └── /services/book         Service booking form
├── /courier
│   └── /courier/book          Courier booking form
├── /about
├── /contact                   Form + WhatsApp + map/details
├── /faq
├── /privacy
├── /terms
└── /admin                     (see ADMIN_PLAN.md)
```

### 2.1 Primary nav
- Shop  
- Services  
- Courier  
- About  
- Contact  
- Cart  
- WhatsApp (persistent CTA on mobile)

### 2.2 Homepage path chooser
Three clear doors (not a dashboard dump):

| Door | Copy idea | CTA |
|---|---|---|
| Shop | Fashion, personalised gifts, smart-home & home products | Explore Shop |
| Home & Smart Services | Repairs, installs, smart-home setup | Explore Services |
| Courier | Fast, safe delivery across the UK | Book a Delivery |

Then light showcases: featured products, service highlights, courier trust strip.

---

## 3. Shop (ecommerce)

### 3.1 Categories (v1 live)
| Category | Examples |
|---|---|
| Fashion & Accessories | Leather bags, shoes, clothes, accessories, custom leather |
| Personalised Gifts | Engraving, metal tags, keyholders, wood/metal portraits, memorial |
| Smart Home | Vacuums, doorbells, locks, cameras, Wi‑Fi, lighting, sensors, plugs |
| Home & DIY | Tools/equipment and related products he sells |

### 3.2 Product types
| Type | `customisable` | `requires_approval` | UX |
|---|---|---|---|
| Standard | No | No | Add to Cart |
| Ready-to-order personalised | Yes | No | Options + uploads → Cart → Pay |
| Custom-request | Yes | Yes | Request form → admin quote → pay later / invoice link |

### 3.3 Customisation model (day one)
Admin-configurable per product:

- Customisable: yes/no  
- Requires approval: yes/no  
- Custom fields (JSON / related table): text, textarea, select, colour, file upload, number  
- Optional base price + option price deltas  

Cart line items store: `product_id`, quantity, selected options, uploaded file URLs, personalisation snapshot.

### 3.4 Smart-home × installation
- Product page and checkout: **Add installation?** → creates linked service booking intent or add-on line.  
- Service pages: **Need the hardware?** → deep-link into Smart Home shop.  
- Order confirmation can show WhatsApp for scheduling if install was requested.

### 3.5 Checkout & fulfilment
- Stripe Payment Intent / Checkout Session (GBP).  
- Shipping: UK-wide rates (flat / weight / postcode bands — finalize in admin settings).  
- Order emails: customer + admin (Resend).  
- Admin manages inventory, fulfilment status, custom uploads.

---

## 4. Services

### 4.1 Home repairs & improvement
Furniture/TV/shelf/mirror install · painting · wallpaper · doors/hinges/cabinets · small woodwork · taps/sinks · bathroom/kitchen · lights/fittings · socket covers · smoke alarms.

### 4.2 Smart home services
Robot cleaners setup · doorbells · locks · cameras · Wi‑Fi · lighting · bulbs · sensors · plugs · full install & setup.

### 4.3 Booking UX
1. Choose service category + specific need  
2. Postcode (UK validation) + address  
3. Preferred date/time window  
4. Description + optional photos  
5. Contact details  
6. Submit → admin job + email + optional WhatsApp open  

Also: **Chat on WhatsApp** parallel CTA on every service page.

### 4.4 UK coverage
- Accept bookings UK-wide.  
- Postcode field with validation.  
- Admin can flag jobs outside preferred radius later; v1 does not hard-block by city list.  
- Optional: simple “We cover the whole UK” map graphic / interactive UK outline for trust (not a full GIS tool).

---

## 5. Courier

### 5.1 Verticals
- Medical (samples, medicines, kits, documents)  
- Flowers & events (same-day, delicate handling)  
- Legal documents (contracts, urgent paperwork)  
- General delivery  

### 5.2 Booking UX
Pickup address + dropoff address · item type · urgency · notes · contact · photos if needed → admin courier job + email + WhatsApp.

---

## 6. Cross-sell loops (must ship)

| Trigger | Offer |
|---|---|
| Buy smart lock / camera | Add installation |
| Book CCTV install | Shop cameras |
| Buy personalised gift | Courier / gift delivery tip |
| Fashion PDP | Custom tags / engraving upsell |

---

## 7. Tech architecture

### 7.1 App structure (proposed)
```
app/
  (store)/          # public marketing + shop
  (bookings)/       # services + courier forms
  admin/            # see ADMIN_PLAN.md
  api/              # stripe, webhooks, uploads, bookings, contact
lib/                # supabase, stripe, email, uk-postcode, whatsapp
components/
  store/
  shop/
  services/
  courier/
  admin/
  ui/
supabase/
  migrations/
docs/
  VIVABOSS_PLAN.md
  ADMIN_PLAN.md
```

### 7.2 Core integrations
| Service | Role |
|---|---|
| Supabase | Auth (admin), DB, storage (product + personalisation uploads) |
| Stripe | Payments, webhooks |
| Resend | Transactional email (orders, bookings, contact) |
| WhatsApp | `https://wa.me/<number>?text=` deep links with prefilled context |
| Vercel | Hosting + env |

### 7.3 Data domains (high level)
- Catalog: categories, products, variants/options, media, inventory  
- Commerce: carts (client), orders, order_items, payments  
- Custom: product_custom_fields, order_item_customisations, custom_requests  
- Ops: service_jobs, courier_jobs  
- CMS: site_settings, pages/FAQ, homepage blocks  
- CRM-lite: customers (from orders/bookings)

Full schema lives in `ADMIN_PLAN.md` + migrations.

---

## 8. Build phases (execution order)

### Phase A — Foundation
1. Scaffold Next.js + Tailwind + fonts + design tokens  
2. Supabase project + env wiring  
3. Base layouts (store + admin)  
4. Site settings (contact, WhatsApp, logo)  
5. Placeholder imagery system  

### Phase B — Catalog & shopfront
1. Categories + products CRUD (admin)  
2. Shop listing + filters + PDP  
3. Custom fields on PDP + cart snapshot  
4. Custom-request flow  
5. Cart drawer / page  

### Phase C — Checkout
1. Stripe checkout  
2. Webhooks → order paid  
3. Emails (customer + admin)  
4. Order success + track  
5. Installation add-on linkage  

### Phase D — Services & courier
1. Service pages from content model  
2. Service booking form → jobs + email + WhatsApp  
3. Courier pages + booking form  
4. UK postcode UX + coverage messaging  

### Phase E — Admin completeness
1. Dashboard  
2. Orders + inventory  
3. Service jobs + courier jobs boards  
4. Custom requests queue  
5. CMS (homepage, FAQ, contact)  
6. Settings (shipping, Stripe modes, WhatsApp number)  

### Phase F — Polish & launch
1. SEO (metadata, sitemap, robots)  
2. Privacy/Terms  
3. Performance / image optimisation  
4. Mobile QA  
5. Domain connect (vivabossfusion.co.uk)  
6. Client asset swap (logo, photos, real contact)  
7. Soft launch checklist  

---

## 9. Content placeholders (until client sends)

Need real values before go-live (track in admin settings):

- [ ] Logo file(s)  
- [ ] Phone  
- [ ] WhatsApp number (E.164)  
- [ ] Email  
- [ ] Business address  
- [ ] Social links  
- [ ] Product photos  
- [ ] Work / service photos  
- [ ] Shipping rate rules  
- [ ] Exact service price guidance (fixed / from / quote-only)

---

## 10. Non-goals for v1 (explicit)

- Native mobile apps  
- Multi-vendor marketplace  
- Full live driver tracking map  
- Complex ERP / accounting sync  
- Multi-currency  
- Customer account wishlists (optional later)  
- Paystack / Naira  

---

## 11. Success criteria (launch ready)

- [ ] Homepage path chooser works on mobile + desktop  
- [ ] All four shop categories browseable with placeholder products  
- [ ] Standard + personalised + custom-request flows work end-to-end  
- [ ] Stripe test → live path documented  
- [x] Service + courier bookings create admin jobs + emails + WhatsApp  
- [ ] Admin covers shop, jobs, requests, CMS, settings (see admin doc)  
- [ ] Domain live on Vercel with HTTPS  
- [ ] Client can replace placeholders without code  

---

## 12. Build progress

### Step 1 — Design foundation ✅
- [x] Next.js scaffold  
- [x] `vb-*` colour tokens (ink / paper / mist / copper accent)  
- [x] Montserrat + Lato via `next/font`  
- [x] Global utilities (`.vb-container`, display, eyebrow, fade-up)  
- [x] `siteConfig` placeholders + `.env.example`  
- [x] Folder skeleton (`components/ui|store|admin`, `lib`, `types`)  
- [x] Foundation screen proving the system  

### Step 2 — Store + admin shells ✅
- [x] Route group `(store)` with header, footer, WhatsApp FAB  
- [x] Real homepage: brand hero + path chooser + shop/services/courier highlights  
- [x] Public IA live: shop (+ 4 categories), services (+ home / smart / book), courier (+ book), about, contact, FAQ, cart, privacy, terms  
- [x] Admin login preview + dashboard shell with grouped sidebar (full ADMIN_PLAN nav)  
- [x] Admin stub modules for every sidebar destination  
- [x] Shared nav config (`lib/navigation.ts`, `lib/admin-nav.ts`)  

### Step 3 — Supabase + admin auth ✅
- [x] `@supabase/ssr` + `@supabase/supabase-js` clients (browser / server / service role)  
- [x] Middleware session refresh  
- [x] Migration: `profiles`, `categories` (seeded), `site_settings`, `is_admin()` RLS helpers  
- [x] Admin gate via `profiles.role = admin` (+ `ALLOW_ADMIN_PREVIEW` for local shell)  
- [x] Real login form + sign out  
- [x] Setup guide: `docs/SUPABASE_SETUP.md`  

### Step 4 — Products + shop catalogue ✅
- [x] Migration: `products`, `product_custom_fields`, `product-media` storage + demo seeds  
- [x] Admin products list / create / edit / archive  
- [x] Image upload to Supabase Storage  
- [x] Custom fields builder + customisable / approval / installation flags  
- [x] Categories admin read view  
- [x] Shop + category grids + `/product/[slug]` PDP wired to Supabase  

### Gap fix / polish (post–Step 4) ✅
- [x] Branded `not-found` + `error`  
- [x] Env-driven contact + site URL; hide broken WhatsApp until live  
- [x] Skip link, focus-visible, reduced-motion  
- [x] Honest empty category states (no fake products)  
- [x] Path chooser / CTA consistency  
- [x] Homepage depth pass + content standard doc  
- [x] README + Supabase docs updated  

### Step 5 — Cart + PDP configure + Stripe ✅
- [x] Zustand cart with customisation + installation snapshots  
- [x] Interactive PDP (options, uploads, add to cart / custom request)  
- [x] Cart + checkout (UK address) → Stripe Checkout (GBP)  
- [x] Orders + custom_requests migration + customer-uploads bucket  
- [x] Stripe webhook + success page  
- [x] Admin orders + custom requests lists  

### Step 6 — Order ops + inventory + email ✅
- [x] Admin order detail (status, internal notes, email/WhatsApp, line customisation)  
- [x] Inventory apply on paid + admin stock adjust UI + movements table  
- [x] Resend: customer + admin order emails; custom-request emails  

### Step 7 — Service + courier bookings ✅
- [x] `service_jobs` + `courier_jobs` migration + types  
- [x] Public forms: `/services/book`, `/courier/book` (+ photo upload, WhatsApp CTA)  
- [x] Admin boards + detail (status tabs, notes, schedule, email/WhatsApp)  
- [x] Resend: customer + admin emails on new jobs  

### Step 8 — Marketing depth ✅
- [x] About: brand story, arms, coverage, working-with-us + CTAs  
- [x] Contact: live details + working form → Resend  
- [x] FAQ: shop / personalised / services / courier / orders  
- [x] Services hub + home + smart-home + courier: how-it-works, cross-sell, care, closing CTAs  
- [x] Homepage: craft moment, deeper courier trust, personalised + closing polish  

### Step 9 — Ops polish + email lock ✅
- [x] Resend: every event notifies **admin@vivabossfusion.co.uk** (code default + `docs/EMAIL.md`)  
- [x] Paid order with installation → linked `service_jobs` (checkout_addon) + admin email  
- [x] Admin dashboard live KPIs + Resend status  

### Step 10 — Gap close ✅
- [x] Durable uploads (paths in DB) + admin signed-URL refresh  
- [x] Custom request detail / quote email / convert-to-Stripe pay  
- [x] Order ↔ install job links; `/order/track`  
- [x] Admin settings + CMS (homepage/FAQ/pages) + customers aggregation  
- [x] UK postcode validation; shipping bands (Highlands/NI + settings)  
- [x] sitemap.xml + robots.txt; Privacy/Terms templates  
- [x] Shop filters; PDP cross-sells; brand mark in header/footer  

### Still needs you (not code)
1. Wire `.env.local` / Vercel: Supabase + Stripe + `RESEND_API_KEY` + live phone/WhatsApp  
2. Run all SQL migrations in order  
3. Create Supabase admin user (`profiles.role = admin`)  
4. Replace brand mark / product photos with client assets when ready  
5. Optional solicitor pass on Privacy/Terms  

### Later
- Rate limits / CAPTCHA on public forms  
- Categories CRUD UI  

---

## Appendix A — Copy sources (from client script)

Use the provided Vivaboss script as source of truth for section copy; refine for web length and SEO titles. Fashion section “5.” duplicate in the script is the same Handmade Fashion arm — do not create a fifth top-level business.

## Appendix B — Reference repos (inspiration only — never copy, never settle)

- `C:\Users\Kaelo\t40-perfumes` — admin shell patterns, Stripe flows, CMS shape  
- `C:\Users\Kaelo\lee-lagos-new` — storefront rhythm, motion ideas, shop energy  

Do **not** copy brand tokens (`t40-*` / `lee-*`); invent `vb-*` tokens for Vivaboss.  
Do **not** ship a screen that merely matches them — Vivaboss should make both look dated beside it.
