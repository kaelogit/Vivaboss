# Vivaboss Admin — Complete Blueprint

**Goal:** One admin that runs the whole business — shop, personalisation requests, service jobs, courier jobs, inventory, CMS, and settings — and is **cleaner, calmer, and more polished than T40**. T40 is the floor for structure, not the finish line.  
**Audience:** Vivaboss operators (non-technical). Clarity > density. Beauty still matters: quiet UI, sharp hierarchy, no clutter.  
**URL:** `/admin` (protected)  
**North star:** Same as the public site — Vivaboss must outclass T40 + Lee combined; the admin is part of that promise.

Companion: [`VIVABOSS_PLAN.md`](./VIVABOSS_PLAN.md)

---

## 1. Design principles

1. **One admin, clear domains** — sidebar groups mirror how the business thinks.  
2. **Queues first** — unpaid attention items (new orders, new jobs, pending custom requests) surface on the dashboard.  
3. **Status everywhere** — every order/job/request has a visible lifecycle.  
4. **Email is automatic; WhatsApp is one click** — every detail page has “Open WhatsApp” with prefilled context.  
5. **Custom products are first-class** — uploads and option snapshots are readable without opening JSON.  
6. **Mobile-usable** — responsive shell like T40 (`AdminShell` + collapsible sidebar).  
7. **No clutter** — empty states, filters, and search; avoid mega-tables of unused columns.

### Visual
- Neutral canvas (`bg-neutral-50`), white panels, sharp or lightly rounded controls.  
- Heading font + compact UI type.  
- Status pills: semantic colours (pending / in progress / done / cancelled).  
- Vivaboss logo mark in sidebar header.

---

## 2. Auth & access

| Item | v1 |
|---|---|
| Auth | Supabase Auth (email + password) |
| Roles | `admin` only (single role) |
| Gate | Middleware + server `requireAdminUser` |
| Login | `/admin/login` |
| Session | Cookie SSR (`@supabase/ssr`) |
| Future | Staff roles (ops / shop-only) — not v1 |

---

## 3. Sidebar information architecture

```
Dashboard
────────────
SHOP
  Products
  Categories
  Inventory
  Orders
  Custom Requests
────────────
OPERATIONS
  Service Jobs
  Courier Jobs
────────────
CUSTOMERS
  Customers
────────────
CONTENT
  Homepage
  FAQ
  Pages (About / Contact blurb)
────────────
SETTINGS
  General & Contact
  Shipping
  Payments (Stripe mode indicator)
  Notifications
────────────
[email]  Sign out
```

Badge counts on: Orders (new), Custom Requests (pending), Service Jobs (new), Courier Jobs (new).

---

## 4. Module specs

### 4.1 Dashboard (`/admin`)
**Purpose:** What needs attention today.

Widgets:
- KPI row: today’s orders · today’s revenue (GBP) · open service jobs · open courier jobs · pending custom requests  
- Attention list: newest unpaid-attention items across domains  
- Recent orders (5)  
- Recent bookings (5)  
- Low stock alerts  

### 4.2 Products (`/admin/products`)
**List:** search, filter by category / type / active, thumbnail, price, stock, customisable badge, approval badge.

**Create / Edit (`/admin/products/new`, `/[id]`):**

| Section | Fields |
|---|---|
| Basics | Name, slug, short description, long description, category, status (draft/active) |
| Media | Multi-image upload, cover image, alt text |
| Pricing | Price (GBP), compare-at (optional), cost (optional, internal) |
| Inventory | Track stock yes/no, quantity, low-stock threshold |
| Type | Standard · Customisable · Requires approval |
| Custom fields builder | Add field: label, key, type (`text` \| `textarea` \| `select` \| `colour` \| `number` \| `file`), required, options, price_delta rules |
| Installation offer | Toggle “offer installation”; linked service type; add-on price or “quote” |
| SEO | Meta title / description (optional) |

**Actions:** duplicate product, archive, delete (soft preferred).

### 4.3 Categories (`/admin/categories`)
- Fashion · Personalised · Smart Home · Home & DIY (seeded)  
- Name, slug, description, image, sort order, visible  

### 4.4 Inventory (`/admin/inventory`)
- Flat stock table: product, SKU (if any), qty, low flag  
- Quick adjust (+/−) with reason note  
- Filter: low stock only  

### 4.5 Orders (`/admin/orders`)
**List filters:** status, date range, search (name/email/order #), has personalisation, has installation.

**Statuses:**
`pending_payment` → `paid` → `processing` → `personalising` (optional) → `shipped` → `delivered` → `cancelled` · `refunded`

**Detail page must show:**
- Customer + shipping address + phone  
- Line items with option snapshot  
- Personalisation uploads (inline preview + download)  
- Installation requested? → link to related service job  
- Payment (Stripe id, amount, status)  
- Internal notes  
- Status changer  
- Buttons: Email customer · WhatsApp customer · Resend confirmation  

### 4.6 Custom Requests (`/admin/custom-requests`)
For `requires_approval` products / freeform custom work.

**Statuses:** `new` → `reviewing` → `quoted` → `accepted` → `declined` · `converted_to_order`

**Detail:**
- Requested product / free text  
- Uploads, materials, instructions  
- Contact  
- Quote amount + message  
- Convert to order (creates payable Stripe link or draft order)  
- WhatsApp / email actions  

### 4.7 Service Jobs (`/admin/service-jobs`)
**Types:** home_repair · smart_home_install · other  

**Statuses:** `new` → `contacted` → `scheduled` → `in_progress` → `completed` · `cancelled`

**Fields:** service category, specific service, description, photos, postcode, address (UK), preferred window, contact, source (`website` \| `checkout_addon` \| `admin`), related order id (optional), internal notes.

**List:** kanban **or** filterable table (v1 = table + status tabs; kanban nice-to-have).

**Actions:** WhatsApp, email, mark scheduled (date/time), assign note.

### 4.8 Courier Jobs (`/admin/courier-jobs`)
**Verticals:** medical · flowers_events · legal · general  

**Statuses:** `new` → `confirmed` → `picked_up` → `delivered` · `failed` · `cancelled`

**Fields:** pickup address, dropoff address, item description, urgency (`standard` \| `same_day` \| `urgent`), notes, contact, photos, preferred window, internal notes.

Same notification pattern: email on create + WhatsApp CTA.

### 4.9 Customers (`/admin/customers`)
- Aggregated from orders + bookings by email/phone  
- Profile: contact, order count, job count, last activity  
- Deep links to related records  
- No full CRM automation in v1  

### 4.10 Content CMS

#### Homepage (`/admin/content/homepage`)
Editable blocks:
- Hero eyebrow / headline / subcopy / CTA labels  
- Path chooser cards (3): title, blurb, link, image  
- Featured product IDs  
- Services highlight blurb  
- Courier trust strip  

#### FAQ (`/admin/content/faq`)
Categories + Q&A items, sort order, visible.

#### Pages (`/admin/content/pages`)
About body, contact intro, optional announcement bar.

### 4.11 Settings

#### General & Contact
- Business name, logo upload  
- Phone, WhatsApp (E.164), email, address  
- Social links  
- Brand accent (optional override)  

#### Shipping
- UK-wide default rate(s)  
- Free-shipping threshold (optional)  
- Collection enabled toggle  

#### Payments
- Stripe mode badge (test/live) — keys in env only, not editable in UI  
- Currency locked GBP  

#### Notifications
- Admin notification email(s) (comma-separated)  
- Toggle: email on order / service / courier / custom request  
- WhatsApp number used in deep links  

---

## 5. Notification matrix

| Event | Admin email | Customer email | WhatsApp |
|---|---|---|---|
| Order paid | Yes | Yes (receipt) | Optional deep link from admin |
| Custom request submitted | Yes | Yes (received) | Admin CTA |
| Service job submitted | Yes | Yes (received) | Form CTA + admin CTA |
| Courier job submitted | Yes | Yes (received) | Form CTA + admin CTA |
| Quote sent (custom request) | — | Yes | Admin CTA |
| Status changes (optional v1.1) | Configurable | Configurable | — |

All public forms also offer **Continue on WhatsApp** that opens a prefilled chat (does not replace DB insert).

---

## 6. Data model (admin-facing)

### 6.1 Tables (proposed)

```
profiles                 # id ↔ auth.users, role
categories
products
product_images
product_custom_fields
inventory_movements

orders
order_items
order_item_customisations   # field snapshots + file urls
payments                    # stripe refs

custom_requests
custom_request_files

service_jobs
service_job_files

courier_jobs
courier_job_files

customers                   # denormalised or view
site_settings               # key/value or jsonb
homepage_content
faq_categories
faq_items
page_content
```

### 6.2 Product flags
```ts
type ProductTypeFlags = {
  is_customisable: boolean
  requires_approval: boolean
  offers_installation: boolean
  installation_service_key?: string
  installation_price_gbp?: number | null // null = quote
}
```

### 6.3 Custom field schema
```ts
type CustomField = {
  id: string
  product_id: string
  label: string
  key: string
  field_type: 'text' | 'textarea' | 'select' | 'colour' | 'number' | 'file'
  required: boolean
  options?: { label: string; value: string; price_delta_gbp?: number }[]
  sort_order: number
}
```

### 6.4 RLS (high level)
- Public read: active products, categories, CMS  
- Public insert: orders (via service role in API), custom_requests, service_jobs, courier_jobs  
- Admin CRUD: everything via authenticated admin role  
- Storage buckets: `product-media` (public read), `customer-uploads` (private / signed)

---

## 7. API surface (admin + public write)

| Route | Purpose |
|---|---|
| `POST /api/checkout` | Create Stripe session from cart |
| `POST /api/webhooks/stripe` | Mark order paid |
| `POST /api/custom-requests` | Public submit |
| `POST /api/service-jobs` | Public submit |
| `POST /api/courier-jobs` | Public submit |
| `POST /api/contact` | Contact form |
| `POST /api/upload` | Signed upload for personalisation / bookings |
| `GET/PATCH /api/admin/...` | Admin mutations as needed |

Prefer server actions where they stay clean; keep webhooks and Stripe in route handlers.

---

## 8. Admin UX patterns (steal the cleanliness, not the brand)

From T40 patterns to reuse conceptually:
- `AdminShell` + `AdminSidebar`  
- List pages with search + filters + primary “Add” button  
- Form sections with clear headings  
- Image uploader component  
- Empty states with one CTA  

Vivaboss-specific additions:
- Jobs boards for services + courier  
- Custom field builder on product form  
- File gallery on order/request detail  
- WhatsApp action button component (`WhatsAppButton`)  
- UK postcode display + validation helpers  

---

## 9. Seed data for admin testing

1. Four categories  
2. ≥2 products per category (placeholders)  
3. ≥1 customisable product (keyholder-style fields)  
4. ≥1 requires-approval product (portrait engraving)  
5. ≥1 smart-home product with installation offer  
6. Sample FAQ (shipping, personalisation lead times, coverage)  
7. Homepage path-chooser copy from plan  
8. Demo admin user  

---

## 10. Admin build checklist (do not miss)

### Shell & auth
- [ ] Login / logout  
- [ ] Protected layout + middleware  
- [ ] Sidebar + mobile drawer  
- [ ] Dashboard attention widgets  

### Shop
- [ ] Categories CRUD  
- [ ] Products CRUD + media  
- [ ] Custom fields builder  
- [ ] Approval flag + installation offer  
- [ ] Inventory list + adjustments  
- [ ] Orders list + detail + status  
- [ ] Personalisation assets on order  
- [ ] Custom requests queue + quote + convert  

### Operations
- [ ] Service jobs list + detail + statuses  
- [ ] Courier jobs list + detail + statuses  
- [ ] WhatsApp + email actions on both  

### Customers & content
- [ ] Customers list + detail  
- [ ] Homepage CMS  
- [ ] FAQ CMS  
- [ ] About/Contact content  

### Settings
- [ ] Contact / WhatsApp / logo  
- [ ] Shipping rates  
- [ ] Notification emails  
- [ ] Stripe mode indicator  

### Quality
- [ ] Empty states  
- [ ] Loading / error toasts  
- [ ] Mobile admin pass  
- [ ] Audit: every public form creates an admin-visible record + email  

---

## 11. Out of scope for admin v1

- Multi-staff permissions matrix  
- Live courier GPS tracking  
- Accounting export (Xero/QuickBooks)  
- Automated SMS  
- Advanced analytics BI  
- In-admin Stripe key editing  

---

## 12. Implementation order (admin track)

1. Auth + shell + settings (contact)  
2. Categories + products + custom fields  
3. Orders (read) wired to Stripe webhook  
4. Custom requests  
5. Service jobs + courier jobs  
6. Inventory  
7. Customers aggregation  
8. CMS  
9. Dashboard badges / KPIs  
10. Polish + empty states  

This order unblocks the public site incrementally while keeping ops usable early.
