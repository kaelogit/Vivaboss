-- ═══════════════════════════════════════════════════════════
-- Vivaboss Fusion — MASSIVE DEMO SEED
-- ═══════════════════════════════════════════════════════════
-- Run in Supabase SQL Editor AFTER or AFTER migrations are applied.
-- Safe to re-run: products upsert by slug; demo ops rows are replaced.
--
-- After running:
--   • Shop catalogue fills with active products + images
--   • Admin shows orders, custom requests, service/courier jobs, reviews
--   • Homepage CMS / FAQ / announcement get editable content
--
-- Images point at files already in /public/marketing/ on the Next site.
-- ═══════════════════════════════════════════════════════════

begin;

-- ─── 0. Wipe previous demo ops data (emails @demo.vivabossfusion.co.uk) ───
delete from public.order_items
where order_id in (
  select id from public.orders where email ilike '%@demo.vivabossfusion.co.uk'
);
delete from public.orders where email ilike '%@demo.vivabossfusion.co.uk';
delete from public.custom_requests where email ilike '%@demo.vivabossfusion.co.uk';
delete from public.service_jobs where email ilike '%@demo.vivabossfusion.co.uk';
delete from public.courier_jobs where email ilike '%@demo.vivabossfusion.co.uk';
delete from public.reviews where email ilike '%@demo.vivabossfusion.co.uk'
  or author_name ilike 'Demo %';

-- ─── 1. Categories (ensure + images) ───────────────────────
insert into public.categories (slug, name, description, image_url, sort_order, is_visible)
values
  (
    'fashion',
    'Fashion & Accessories',
    'Handmade leather, shoes, and modern African-inspired style.',
    '/marketing/shop-p1-leather-bag.jpg',
    1,
    true
  ),
  (
    'personalised',
    'Personalised Gifts',
    'Engraving, custom tags, memorial and anniversary pieces.',
    '/marketing/shop-p3-personalised-gift.jpg',
    2,
    true
  ),
  (
    'smart-home',
    'Smart Home',
    'Locks, cameras, lighting, sensors — ready for UK homes.',
    '/marketing/smart-sh1-product-collection.jpg',
    3,
    true
  ),
  (
    'home-diy',
    'Home & DIY',
    'Equipment and essentials for home improvement.',
    '/marketing/service-s2-painting.jpg',
    4,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible;

-- ─── 2. Products (upsert by slug) ───────────────────────────
with catalogue as (
  select * from (
    values
      -- Fashion
      (
        'fashion',
        'Handmade Leather Tote',
        'handmade-leather-tote',
        'Crafted leather tote with durable stitching and copper hardware.',
        'Everyday-luxury tote inspired by African craft and modern lines. Chestnut leather, fine stitching, made to look good and last.',
        120.00::numeric, null::numeric,
        array['/marketing/shop-p1-leather-bag.jpg', '/marketing/craft-a3-fashion-bag.jpg']::text[],
        false, false, false, null::text, null::numeric, 12, true
      ),
      (
        'fashion',
        'Crossbody Craft Bag',
        'crossbody-craft-bag',
        'Compact handmade crossbody for city days.',
        'A lighter everyday bag with geometric strap detail and secure closure. Built for London pace without losing craft.',
        95.00, 110.00,
        array['/marketing/craft-a3-fashion-bag.jpg', '/marketing/shop-p1-leather-bag.jpg']::text[],
        false, false, false, null, null, 10, true
      ),
      (
        'fashion',
        'Handcrafted Leather Shoes',
        'handcrafted-leather-shoes',
        'Structured leather shoes with a clean modern finish.',
        'Handmade leather shoes with careful lasting and a durable sole. Pair with our fashion edit for a full look.',
        145.00, null,
        array['/marketing/shop-p2-leather-shoes.jpg']::text[],
        false, false, false, null, null, 8, true
      ),
      (
        'fashion',
        'Custom Leather Keyholder',
        'custom-leather-keyholder',
        'Make it yours — name, initials or message.',
        'Personalised leather keyholder. Choose colour, add your text, and we craft it with care.',
        25.00, null,
        array['/marketing/craft-a2-materials.jpg']::text[],
        true, false, false, null, null, 40, true
      ),
      (
        'fashion',
        'Leather Card Wallet',
        'leather-card-wallet',
        'Slim wallet with stitched edge finish.',
        'Minimal leather wallet for cards and folded notes. Soft grain, copper accent stitch, made to soften with use.',
        38.00, null,
        array['/marketing/craft-a2-materials.jpg', '/marketing/shop-p1-leather-bag.jpg']::text[],
        false, false, false, null, null, 22, true
      ),
      (
        'fashion',
        'Workshop Belt',
        'workshop-belt',
        'Full-grain belt with understated buckle.',
        'A clean belt cut from the same leather family as our bags — sturdy, simple, and built for daily wear.',
        55.00, null,
        array['/marketing/craft-a1-workshop.jpg']::text[],
        false, false, false, null, null, 18, true
      ),

      -- Personalised
      (
        'personalised',
        'Custom Photo Wood Engraving',
        'custom-photo-wood-engraving',
        'Turn a favourite photo into engraved wood.',
        'Upload your photo, choose a size, and optionally add a message. Ready-to-order personalisation with careful finishing.',
        45.00, null,
        array['/marketing/shop-p4-photo-engraving.jpg', '/marketing/craft-a4-engraving.jpg']::text[],
        true, false, false, null, null, 25, true
      ),
      (
        'personalised',
        'Portrait Engraving on Metal',
        'portrait-engraving-metal',
        'Complex portrait work — request a custom quote.',
        'For detailed portrait engraving we review your image first, then confirm design and price before production.',
        0.00, null,
        array['/marketing/craft-a4-engraving.jpg']::text[],
        true, true, false, null, null, null::int, false
      ),
      (
        'personalised',
        'Personalised Gift Set',
        'personalised-gift-set',
        'Curated gift piece ready for a name or message.',
        'A gift-ready set for birthdays and anniversaries. Add a short message at checkout and we finish it with care.',
        68.00, 79.00,
        array['/marketing/shop-p3-personalised-gift.jpg']::text[],
        true, false, false, null, null, 16, true
      ),
      (
        'personalised',
        'Memorial Wood Plaque',
        'memorial-wood-plaque',
        'Quiet, lasting memorial engraving.',
        'A respectful memorial plaque in warm wood. Configure a short dedication — for more complex portraits, use our metal request flow.',
        72.00, null,
        array['/marketing/craft-a4-engraving.jpg', '/marketing/shop-p4-photo-engraving.jpg']::text[],
        true, false, false, null, null, 14, true
      ),
      (
        'personalised',
        'Metal Name Tag Duo',
        'metal-name-tag-duo',
        'Two engraved metal tags for keys or bags.',
        'A pair of metal tags with clean engraving. Ideal for couples, siblings, or matching travel tags.',
        32.00, null,
        array['/marketing/shop-p3-personalised-gift.jpg', '/marketing/craft-a2-materials.jpg']::text[],
        true, false, false, null, null, 30, true
      ),

      -- Smart home
      (
        'smart-home',
        'Smart Door Lock',
        'smart-door-lock',
        'Keyless entry for a safer home.',
        'Modern smart lock ready for UK homes. Add professional installation at checkout if you want us to fit it.',
        189.00, 219.00,
        array['/marketing/service-s4-smart-lock.jpg', '/marketing/smart-sh1-product-collection.jpg']::text[],
        false, false, true, 'smart-home', 75.00, 15, true
      ),
      (
        'smart-home',
        'Security Camera Kit',
        'security-camera-kit',
        'Clear monitoring with simple setup.',
        'A reliable camera kit for homes and small businesses. Optional Vivaboss installation available.',
        149.00, null,
        array['/marketing/smart-sh1-product-collection.jpg']::text[],
        false, false, true, 'smart-home', 90.00, 12, true
      ),
      (
        'smart-home',
        'Smart Doorbell',
        'smart-doorbell',
        'See who is at the door — day or night.',
        'Video doorbell with clear audio and app alerts. Pair with our smart-home install service for tidy fitting.',
        119.00, 139.00,
        array['/marketing/smart-sh1-product-collection.jpg', '/marketing/service-s4-smart-lock.jpg']::text[],
        false, false, true, 'smart-home', 55.00, 20, true
      ),
      (
        'smart-home',
        'Mood Lighting Starter Pack',
        'mood-lighting-starter-pack',
        'Warm LED bulbs and a simple controller.',
        'A starter pack for calmer evenings — warm tones, app-friendly bulbs, ready for UK fittings.',
        64.00, null,
        array['/marketing/service-s5-lighting.jpg']::text[],
        false, false, true, 'smart-home', 45.00, 28, true
      ),
      (
        'smart-home',
        'Smart Plug Twin Pack',
        'smart-plug-twin-pack',
        'Schedule lamps and small appliances.',
        'Two compact smart plugs for UK sockets. Useful for lamps, chargers, and simple automation.',
        29.00, null,
        array['/marketing/smart-sh1-product-collection.jpg']::text[],
        false, false, false, null, null, 45, true
      ),
      (
        'smart-home',
        'Motion Sensor Bundle',
        'motion-sensor-bundle',
        'Hallway and landing motion sensors.',
        'A pair of motion sensors for safer landings and automated lighting cues. Install available on request.',
        42.00, null,
        array['/marketing/service-s6-smoke-alarm.jpg']::text[],
        false, false, true, 'smart-home', 40.00, 24, true
      ),

      -- Home & DIY
      (
        'home-diy',
        'Wall Shelf Fixing Kit',
        'wall-shelf-fixing-kit',
        'Essentials for clean shelf installs.',
        'Quality fixings for shelves and light wall-mounted furniture. Pair with our home installation service if needed.',
        18.00, null,
        array['/marketing/service-s1-tv-install.jpg']::text[],
        false, false, false, null, null, 50, true
      ),
      (
        'home-diy',
        'Painter''s Prep Bundle',
        'painters-prep-bundle',
        'Tape, sheets, and tray for tidy decorating.',
        'A practical prep bundle for small rooms and touch-ups — drop cloths, masking tape, and a clean roller tray.',
        24.00, null,
        array['/marketing/service-s2-painting.jpg']::text[],
        false, false, false, null, null, 35, true
      ),
      (
        'home-diy',
        'Bathroom Fixings Pack',
        'bathroom-fixings-pack',
        'Seals, washers, and tidy bathroom hardware.',
        'A curated pack for common bathroom fixes. For leaks and installs, book a Vivaboss home visit too.',
        22.00, null,
        array['/marketing/service-s3-plumbing.jpg']::text[],
        false, false, false, null, null, 40, true
      ),
      (
        'home-diy',
        'Lighting Fit Kit',
        'lighting-fit-kit',
        'Ceiling rose and fixing essentials.',
        'Support kit for swapping simple light fittings. Electrical work beyond this pack should be booked as a service visit.',
        27.00, null,
        array['/marketing/service-s5-lighting.jpg']::text[],
        false, false, false, null, null, 26, true
      ),
      (
        'home-diy',
        'Smoke Alarm Twin Pack',
        'smoke-alarm-twin-pack',
        'Two alarms ready for hallway and landing.',
        'A twin pack for safer homes. Prefer us to fit them? Book a small electrical / safety visit.',
        34.00, null,
        array['/marketing/service-s6-smoke-alarm.jpg']::text[],
        false, false, false, null, null, 32, true
      ),
      (
        'home-diy',
        'TV Mount Essentials',
        'tv-mount-essentials',
        'Mount hardware and cable management clips.',
        'Essentials for a cleaner TV wall install. Combine with our TV installation service for a finished look.',
        29.00, 35.00,
        array['/marketing/service-s1-tv-install.jpg', '/marketing/service-s5-lighting.jpg']::text[],
        false, false, false, null, null, 19, true
      ),
      (
        'fashion',
        'Craft Workshop Scarf',
        'craft-workshop-scarf',
        'Soft textile with subtle geometric detail.',
        'A modern scarf piece nodding to African-inspired geometry without costume energy — soft, wearable, gift-ready.',
        48.00, null,
        array['/marketing/hero-b-craft-fashion-home.jpg', '/marketing/craft-workshop.jpg']::text[],
        false, false, false, null, null, 15, true
      ),
      (
        'personalised',
        'Anniversary Engraved Frame',
        'anniversary-engraved-frame',
        'Frame blank with dedicated engraving band.',
        'A warm anniversary frame with space for a short dedication. Upload optional photo notes in the custom fields.',
        58.00, null,
        array['/marketing/shop-p3-personalised-gift.jpg', '/marketing/shop-p4-photo-engraving.jpg']::text[],
        true, false, false, null, null, 11, true
      )
  ) as v(
    category_slug, name, slug, short_description, description,
    price_gbp, compare_at_gbp, images,
    is_customisable, requires_approval, offers_installation,
    installation_service_key, installation_price_gbp, stock_quantity, track_stock
  )
)
insert into public.products (
  category_id, name, slug, short_description, description,
  price_gbp, compare_at_gbp, images, status,
  is_customisable, requires_approval, offers_installation,
  installation_service_key, installation_price_gbp,
  track_stock, stock_quantity,
  meta_title, meta_description
)
select
  c.id,
  v.name,
  v.slug,
  v.short_description,
  v.description,
  v.price_gbp,
  v.compare_at_gbp,
  v.images,
  'active'::public.product_status,
  v.is_customisable,
  v.requires_approval,
  v.offers_installation,
  v.installation_service_key,
  v.installation_price_gbp,
  v.track_stock,
  v.stock_quantity,
  v.name || ' | Vivaboss Fusion',
  v.short_description
from catalogue v
join public.categories c on c.slug = v.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price_gbp = excluded.price_gbp,
  compare_at_gbp = excluded.compare_at_gbp,
  images = excluded.images,
  status = excluded.status,
  is_customisable = excluded.is_customisable,
  requires_approval = excluded.requires_approval,
  offers_installation = excluded.offers_installation,
  installation_service_key = excluded.installation_service_key,
  installation_price_gbp = excluded.installation_price_gbp,
  track_stock = excluded.track_stock,
  stock_quantity = excluded.stock_quantity,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description;

-- ─── 3. Custom fields ───────────────────────────────────────
insert into public.product_custom_fields (product_id, label, key, field_type, required, options, sort_order)
select p.id, f.label, f.key, f.field_type, f.required, f.options::jsonb, f.sort_order
from public.products p
join (
  values
    ('custom-leather-keyholder', 'Leather colour', 'colour', 'select', true,
     '[{"label":"Black","value":"black"},{"label":"Tan","value":"tan"},{"label":"Burgundy","value":"burgundy"},{"label":"Cognac","value":"cognac"}]', 1),
    ('custom-leather-keyholder', 'Name / message', 'message', 'text', true, '[]', 2),
    ('custom-leather-keyholder', 'Engraving style', 'style', 'select', false,
     '[{"label":"Block","value":"block"},{"label":"Script","value":"script"}]', 3),

    ('custom-photo-wood-engraving', 'Size', 'size', 'select', true,
     '[{"label":"Small","value":"small","price_delta_gbp":0},{"label":"Medium","value":"medium","price_delta_gbp":10},{"label":"Large","value":"large","price_delta_gbp":25}]', 1),
    ('custom-photo-wood-engraving', 'Upload photo', 'photo', 'file', true, '[]', 2),
    ('custom-photo-wood-engraving', 'Message (optional)', 'message', 'textarea', false, '[]', 3),

    ('portrait-engraving-metal', 'Upload reference image', 'photo', 'file', true, '[]', 1),
    ('portrait-engraving-metal', 'Preferred material', 'material', 'text', false, '[]', 2),
    ('portrait-engraving-metal', 'Additional instructions', 'notes', 'textarea', false, '[]', 3),

    ('personalised-gift-set', 'Recipient name', 'recipient', 'text', true, '[]', 1),
    ('personalised-gift-set', 'Gift message', 'message', 'textarea', false, '[]', 2),

    ('memorial-wood-plaque', 'Dedication line', 'dedication', 'textarea', true, '[]', 1),
    ('memorial-wood-plaque', 'Dates (optional)', 'dates', 'text', false, '[]', 2),

    ('metal-name-tag-duo', 'Tag 1 text', 'tag_one', 'text', true, '[]', 1),
    ('metal-name-tag-duo', 'Tag 2 text', 'tag_two', 'text', true, '[]', 2),

    ('anniversary-engraved-frame', 'Names', 'names', 'text', true, '[]', 1),
    ('anniversary-engraved-frame', 'Date', 'date_text', 'text', false, '[]', 2),
    ('anniversary-engraved-frame', 'Short message', 'message', 'textarea', false, '[]', 3)
) as f(product_slug, label, key, field_type, required, options, sort_order)
  on p.slug = f.product_slug
on conflict (product_id, key) do update set
  label = excluded.label,
  field_type = excluded.field_type,
  required = excluded.required,
  options = excluded.options,
  sort_order = excluded.sort_order;

-- ─── 4. Site settings / CMS ─────────────────────────────────
insert into public.site_settings (key, value) values
  (
    'homepage',
    '{
      "heroEyebrow": "Vivaboss Fusion Services",
      "heroHeadline": "Vivaboss",
      "heroSub": "Craft. Home. Delivery.",
      "heroTagline": "People will stare. Make it worth their while.",
      "pathChooserEyebrow": "What are you looking for?",
      "pathChooserTitle": "Three ways into Vivaboss",
      "craftHeadline": "Culture in the craft. Care in every handover.",
      "craftBody": "Handmade fashion and personalised pieces sit beside smart-home kits, home visits, and careful courier runs — one umbrella brand with one standard."
    }'::jsonb
  ),
  (
    'pages',
    '{
      "aboutIntro": "Vivaboss Fusion Services is an umbrella brand spanning craft, home, and delivery across the UK — shop handmade fashion and gifts, book repairs and smart-home installs, and move what matters with care.",
      "contactIntro": "Questions about an order, a custom piece, a home visit, or a courier run — reach us here. Bookings also have dedicated forms if you already know what you need.",
      "announcement": "Demo catalogue live — UK-wide shop · services · courier. Edit this bar in Admin → Pages."
    }'::jsonb
  ),
  (
    'faq',
    '{
      "items": [
        {"category":"Shop","q":"Do you ship UK-wide?","a":"Yes. Shop orders ship across the United Kingdom. Shipping bands are configurable in Admin → Settings."},
        {"category":"Shop","q":"Can I personalise products?","a":"Many gifts are configurable in the product page. Complex portrait work uses a custom request so we can review before quoting."},
        {"category":"Services","q":"How do bookings work?","a":"Submit the form with postcode and preferred window. We confirm by email before we attend."},
        {"category":"Courier","q":"What can you move?","a":"Medical, legal, flowers & events, and general packages — with urgency options on the booking form."},
        {"category":"Payments","q":"How do I pay?","a":"Shop checkout uses Stripe in GBP. Custom requests are quoted first, then paid when accepted."}
      ]
    }'::jsonb
  ),
  (
    'shipping',
    '{
      "ukWide": true,
      "collectionEnabled": false,
      "defaultRateGbp": 4.95,
      "freeOverGbp": 75,
      "bands": [
        {"id":"standard","label":"UK Standard","minOrderGbp":0,"maxOrderGbp":74.99,"rateGbp":4.95},
        {"id":"free","label":"UK Free over £75","minOrderGbp":75,"maxOrderGbp":null,"rateGbp":0}
      ]
    }'::jsonb
  ),
  (
    'contact',
    '{
      "phone": "+44 7700 900123",
      "whatsapp": "+447700900123",
      "email": "hello@vivabossfusion.co.uk",
      "address": "United Kingdom"
    }'::jsonb
  ),
  (
    'brand',
    '{
      "name": "Vivaboss Fusion Services",
      "shortName": "Vivaboss",
      "tagline": "Craftsmanship that turns heads. Style that holds attention.",
      "homepageLine": "Craft. Home. Delivery."
    }'::jsonb
  ),
  (
    'notifications',
    '{
      "adminEmails": ["admin@vivabossfusion.co.uk", "hello@vivabossfusion.co.uk"],
      "emailOnOrder": true,
      "emailOnServiceJob": true,
      "emailOnCourierJob": true,
      "emailOnCustomRequest": true
    }'::jsonb
  )
on conflict (key) do update set value = excluded.value;

-- ─── 5. Demo orders ─────────────────────────────────────────
insert into public.orders (
  id, order_number, status, email, phone, full_name,
  address_line1, address_line2, city, postcode, country,
  subtotal_gbp, shipping_gbp, total_gbp, currency, notes, paid_at
) values
(
  'a1000000-0000-4000-8000-000000000001',
  'VB-10001',
  'paid',
  'amara.okonkwo@demo.vivabossfusion.co.uk',
  '+447700900001',
  'Amara Okonkwo',
  '14 Craft Lane',
  null,
  'London',
  'E1 6AN',
  'GB',
  145.00, 0, 145.00, 'gbp',
  'Gift wrap if possible',
  now() - interval '2 days'
),
(
  'a1000000-0000-4000-8000-000000000002',
  'VB-10002',
  'processing',
  'james.reed@demo.vivabossfusion.co.uk',
  '+447700900002',
  'James Reed',
  '9 Harbour Road',
  'Flat 2',
  'Bristol',
  'BS1 4DJ',
  'GB',
  264.00, 4.95, 268.95, 'gbp',
  null,
  now() - interval '1 day'
),
(
  'a1000000-0000-4000-8000-000000000003',
  'VB-10003',
  'pending_payment',
  'sofia.khan@demo.vivabossfusion.co.uk',
  '+447700900003',
  'Sofia Khan',
  '22 Mill Street',
  null,
  'Manchester',
  'M1 1AE',
  'GB',
  45.00, 4.95, 49.95, 'gbp',
  'Waiting on Stripe test payment',
  null
),
(
  'a1000000-0000-4000-8000-000000000004',
  'VB-10004',
  'shipped',
  'daniel.obi@demo.vivabossfusion.co.uk',
  '+447700900004',
  'Daniel Obi',
  '3 Station Approach',
  null,
  'Leeds',
  'LS1 4DY',
  'GB',
  120.00, 0, 120.00, 'gbp',
  null,
  now() - interval '5 days'
);

insert into public.order_items (
  order_id, product_id, product_name, product_slug,
  unit_price_gbp, quantity, line_total_gbp, image_url,
  customisation, installation_requested, installation_price_gbp
)
select
  o.id,
  p.id,
  p.name,
  p.slug,
  v.unit_price,
  v.qty,
  v.unit_price * v.qty,
  p.images[1],
  v.customisation::jsonb,
  v.install,
  v.install_price
from (
  values
    ('VB-10001', 'handcrafted-leather-shoes', 145.00, 1, '{}', false, null::numeric),
    ('VB-10002', 'smart-door-lock', 189.00, 1, '{}', true, 75.00),
    ('VB-10002', 'smart-plug-twin-pack', 29.00, 1, '{}', false, null),
    ('VB-10003', 'custom-photo-wood-engraving', 45.00, 1,
     '{"size":"medium","message":"Happy birthday Maya"}', false, null),
    ('VB-10004', 'handmade-leather-tote', 120.00, 1, '{}', false, null)
) as v(order_number, product_slug, unit_price, qty, customisation, install, install_price)
join public.orders o on o.order_number = v.order_number
join public.products p on p.slug = v.product_slug;

-- ─── 6. Custom requests ─────────────────────────────────────
insert into public.custom_requests (
  status, product_id, product_name, full_name, email, phone, whatsapp,
  message, preferred_material, instructions, uploads, field_snapshot,
  quote_amount_gbp, quote_message
)
select
  v.status::public.custom_request_status,
  p.id,
  p.name,
  v.full_name,
  v.email,
  v.phone,
  v.whatsapp,
  v.message,
  v.preferred_material,
  v.instructions,
  '{}'::text[],
  v.field_snapshot::jsonb,
  v.quote_amount_gbp,
  v.quote_message
from (
  values
    (
      'new',
      'portrait-engraving-metal',
      'Chioma Adebayo',
      'chioma.adebayo@demo.vivabossfusion.co.uk',
      '+447700900011',
      '+447700900011',
      'Portrait of my mother for her 70th.',
      'Brushed steel',
      'Prefer warm tone finish if possible.',
      '{"notes":"Family heirloom gift"}',
      null::numeric,
      null::text
    ),
    (
      'reviewing',
      'portrait-engraving-metal',
      'Marcus Bell',
      'marcus.bell@demo.vivabossfusion.co.uk',
      '+447700900012',
      null,
      'Wedding couple portrait — outdoor photo attached later.',
      'Black metal',
      'Need by end of next month.',
      '{}',
      null,
      null
    ),
    (
      'quoted',
      'portrait-engraving-metal',
      'Helen Park',
      'helen.park@demo.vivabossfusion.co.uk',
      '+447700900013',
      '+447700900013',
      'Memorial portrait with short dedication.',
      'Brass',
      'Quiet, respectful finish.',
      '{"dedication":"In loving memory"}',
      185.00,
      'Includes proofing round and UK shipping.'
    )
) as v(
  status, product_slug, full_name, email, phone, whatsapp,
  message, preferred_material, instructions, field_snapshot,
  quote_amount_gbp, quote_message
)
left join public.products p on p.slug = v.product_slug;

-- ─── 7. Service jobs ────────────────────────────────────────
insert into public.service_jobs (
  status, job_type, specific_service, description,
  address_line1, city, postcode, preferred_window,
  full_name, email, phone, whatsapp, source, related_order_id, internal_notes
) values
(
  'new',
  'home_repair',
  'TV wall mount',
  '55\" TV onto solid wall in living room. Cable management preferred.',
  '14 Craft Lane',
  'London',
  'E1 6AN',
  'Weekday mornings',
  'Amara Okonkwo',
  'amara.okonkwo@demo.vivabossfusion.co.uk',
  '+447700900001',
  '+447700900001',
  'website',
  null,
  null
),
(
  'scheduled',
  'smart_home_install',
  'Smart lock install',
  'Fit smart door lock purchased with order VB-10002.',
  '9 Harbour Road',
  'Bristol',
  'BS1 4DJ',
  'Thursday afternoon',
  'James Reed',
  'james.reed@demo.vivabossfusion.co.uk',
  '+447700900002',
  null,
  'checkout_addon',
  'a1000000-0000-4000-8000-000000000002',
  'Confirm door thickness on arrival'
),
(
  'contacted',
  'home_repair',
  'Painting touch-up',
  'Hallway and landing touch-up after small repair.',
  '22 Mill Street',
  'Manchester',
  'M1 1AE',
  'Weekend',
  'Sofia Khan',
  'sofia.khan@demo.vivabossfusion.co.uk',
  '+447700900003',
  '+447700900003',
  'website',
  null,
  'Customer sending photos'
),
(
  'completed',
  'smart_home_install',
  'Doorbell + lighting',
  'Doorbell fitted and two hallway fittings swapped.',
  '3 Station Approach',
  'Leeds',
  'LS1 4DY',
  'Completed last week',
  'Daniel Obi',
  'daniel.obi@demo.vivabossfusion.co.uk',
  '+447700900004',
  null,
  'website',
  null,
  'Paid visit — closed'
);

-- ─── 8. Courier jobs ────────────────────────────────────────
insert into public.courier_jobs (
  status, vertical, urgency, item_description, notes,
  pickup_line1, pickup_city, pickup_postcode,
  dropoff_line1, dropoff_city, dropoff_postcode,
  preferred_window, full_name, email, phone, whatsapp
) values
(
  'new',
  'medical',
  'urgent',
  'Sealed sample pouch in insulated bag',
  'Keep upright. Recipient is reception desk.',
  'City Clinic, 1 High Street',
  'London',
  'W1T 1FB',
  'Lab Desk, 8 Science Park',
  'Cambridge',
  'CB4 0WZ',
  'Today if possible',
  'Ngozi Eze',
  'ngozi.eze@demo.vivabossfusion.co.uk',
  '+447700900021',
  '+447700900021'
),
(
  'confirmed',
  'flowers_events',
  'same_day',
  'Wrapped bouquet + card',
  'Fragile — do not crush.',
  'Bloom House, 5 Market Row',
  'London',
  'SW1A 1AA',
  '42 Rose Court',
  'London',
  'N1 9GU',
  'Before 5pm',
  'Priya Shah',
  'priya.shah@demo.vivabossfusion.co.uk',
  '+447700900022',
  null
),
(
  'picked_up',
  'legal',
  'standard',
  'Sealed document wallet',
  'ID check at drop-off if asked.',
  'Wright & Co Solicitors',
  'Birmingham',
  'B1 1BB',
  'County Court desk',
  'Birmingham',
  'B4 6DS',
  'Tomorrow morning',
  'Owen Clarke',
  'owen.clarke@demo.vivabossfusion.co.uk',
  '+447700900023',
  '+447700900023'
),
(
  'delivered',
  'general',
  'standard',
  'Small business parcel — branded box',
  null,
  'Unit 4, Canal Yard',
  'Manchester',
  'M4 1HQ',
  '18 King Street',
  'Liverpool',
  'L1 8JQ',
  'Completed',
  'Fatima Yusuf',
  'fatima.yusuf@demo.vivabossfusion.co.uk',
  '+447700900024',
  null
);

-- ─── 9. Reviews ─────────────────────────────────────────────
insert into public.reviews (author_name, rating, body, email, is_published)
values
(
  'Demo Amara',
  5,
  'The leather tote feels serious in the best way — stitching, weight, and finish all there. Delivery was smooth.',
  'amara.okonkwo@demo.vivabossfusion.co.uk',
  true
),
(
  'Demo James',
  5,
  'Bought the smart lock and booked install in one flow. Team confirmed the slot and left the door looking clean.',
  'james.reed@demo.vivabossfusion.co.uk',
  true
),
(
  'Demo Priya',
  4,
  'Flower courier was careful and on time for a birthday surprise. Would use again for events.',
  'priya.shah@demo.vivabossfusion.co.uk',
  true
),
(
  'Demo Helen',
  5,
  'Custom engraving request was handled with care. Quote was clear before we committed.',
  'helen.park@demo.vivabossfusion.co.uk',
  true
),
(
  'Demo Marcus',
  4,
  'Good communication on a home painting visit. Photos on the booking form really helped.',
  'marcus.bell@demo.vivabossfusion.co.uk',
  true
);

commit;

-- ─── Quick checks (optional) ────────────────────────────────
-- select count(*) as products from public.products where status = 'active';
-- select count(*) as orders from public.orders;
-- select count(*) as jobs from public.service_jobs;
-- select count(*) as courier from public.courier_jobs;
-- select count(*) as reviews from public.reviews;
