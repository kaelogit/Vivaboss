-- Sample smart-home products (client photo set)
-- Images live in the Next.js public folder for now:
--   /marketing/products/{curtain-motor|smart-plug|video-doorbell|robot-vacuum}/*
-- Later you can re-upload via Admin → Products into Supabase Storage (product-media)
-- and replace the images[] URLs with the public storage URLs.
--
-- Safe to re-run: upserts by slug.

insert into public.products (
  category_id,
  name,
  slug,
  short_description,
  description,
  price_gbp,
  compare_at_gbp,
  images,
  status,
  is_customisable,
  requires_approval,
  offers_installation,
  installation_service_key,
  installation_price_gbp,
  track_stock,
  stock_quantity,
  meta_title,
  meta_description
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
  false,
  false,
  v.offers_installation,
  v.installation_service_key,
  v.installation_price_gbp,
  true,
  v.stock_quantity,
  v.meta_title,
  v.meta_description
from public.categories c
join (
  values
    (
      'smart-home',
      'Vivaboss Smart Curtain Motor',
      'vivaboss-smart-curtain-motor',
      'Turn existing curtains into app- and voice-controlled smart curtains.',
      $d$Clip-on smart curtain motor that hangs on a standard track — no full rail replacement. Works with Tuya and Smart Life apps, and voice assistants such as Alexa. High-accuracy Hall scanning for precise open/close, with a large-capacity ~4000mAh battery (around 6 months typical use). Optional Vivaboss smart-home installation available at checkout.$d$,
      89.00::numeric,
      null::numeric,
      array[
        '/marketing/products/curtain-motor/01-hero.jpg',
        '/marketing/products/curtain-motor/02-kit.jpg',
        '/marketing/products/curtain-motor/03-voice.jpg',
        '/marketing/products/curtain-motor/04-hall-battery.jpg',
        '/marketing/products/curtain-motor/05-hall-battery-alt.jpg'
      ]::text[],
      true,
      'smart-home',
      55.00::numeric,
      20,
      'Vivaboss Smart Curtain Motor',
      'App and voice controlled curtain motor. Tuya / Smart Life compatible, Hall scanning, long battery life.'
    ),
    (
      'smart-home',
      'WiFi Smart Socket',
      'wifi-smart-socket',
      'Universal Wi‑Fi smart plug — app control, schedules, no hub required.',
      $d$Make everyday appliances smart without a hub. Universal socket design, 2.4GHz Wi‑Fi, APP control, timers and schedules, energy reminders, and scene connection. Works with Amazon Alexa and Google Home. Control lights, chargers, and home appliances from anywhere.$d$,
      24.00,
      29.00,
      array[
        '/marketing/products/smart-plug/01-hero.jpg',
        '/marketing/products/smart-plug/02-automated.jpg',
        '/marketing/products/smart-plug/03-timing.jpg',
        '/marketing/products/smart-plug/04-voice.jpg',
        '/marketing/products/smart-plug/05-features.jpg'
      ]::text[],
      false,
      null::text,
      null::numeric,
      50,
      'WiFi Smart Socket',
      'No-hub WiFi smart plug with app control, scheduling, and Alexa / Google Home support.'
    ),
    (
      'smart-home',
      'SELFIECOM Smart Video Doorbell',
      'selfiecom-smart-video-doorbell',
      'Video doorbell with indoor chime, night vision, and app talking.',
      $d$See and speak to visitors from your phone. Includes outdoor doorbell and indoor chime. Two-way video talking, infrared night vision, voice change for privacy, and cloud storage options. Binds to one primary account and can share with up to 9 family members. Important: 2.4GHz Wi‑Fi only (not 5GHz). Optional professional install available.$d$,
      79.00,
      99.00,
      array[
        '/marketing/products/video-doorbell/01-hero.jpg',
        '/marketing/products/video-doorbell/02-overview.jpg',
        '/marketing/products/video-doorbell/03-video-talking.jpg',
        '/marketing/products/video-doorbell/04-night-vision.jpg',
        '/marketing/products/video-doorbell/05-sharing.jpg',
        '/marketing/products/video-doorbell/06-voice-change.jpg'
      ]::text[],
      true,
      'smart-home',
      55.00,
      25,
      'SELFIECOM Smart Video Doorbell',
      'Video doorbell with chime, night vision, voice change, and sharing for up to 9 users. 2.4GHz WiFi only.'
    ),
    (
      'smart-home',
      'Smart Robot Vacuum',
      'smart-robot-vacuum',
      'Slim robot vacuum with planned cleaning paths and quiet running.',
      $d$Intelligent cleaning planning for high coverage and low repetition, plus designated area / spot cleaning. Ultra-thin ~7.8cm body to reach under sofas and beds, with ~1.5cm obstacle crossing. Multi-clean modes and professional-grade noise reduction (under ~65dB in standard mode). Package includes brushes, mop pad, and accessories.$d$,
      159.00,
      189.00,
      array[
        '/marketing/products/robot-vacuum/01-hero.jpg',
        '/marketing/products/robot-vacuum/02-slim.jpg',
        '/marketing/products/robot-vacuum/03-quiet.jpg',
        '/marketing/products/robot-vacuum/04-inbox.jpg'
      ]::text[],
      false,
      null,
      null,
      15,
      'Smart Robot Vacuum',
      'Slim robot vacuum with planned paths, spot cleaning, and quiet operation under ~65dB.'
    )
) as v(
  category_slug,
  name,
  slug,
  short_description,
  description,
  price_gbp,
  compare_at_gbp,
  images,
  offers_installation,
  installation_service_key,
  installation_price_gbp,
  stock_quantity,
  meta_title,
  meta_description
)
  on c.slug = v.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price_gbp = excluded.price_gbp,
  compare_at_gbp = excluded.compare_at_gbp,
  images = excluded.images,
  status = excluded.status,
  offers_installation = excluded.offers_installation,
  installation_service_key = excluded.installation_service_key,
  installation_price_gbp = excluded.installation_price_gbp,
  track_stock = excluded.track_stock,
  stock_quantity = excluded.stock_quantity,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description;
