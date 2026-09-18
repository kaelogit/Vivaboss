-- Seed / replace public FAQ in site_settings (Admin → Content → FAQ)
-- Safe to re-run: upserts key 'faq'.
-- After running: public /faq and Admin → Content → FAQ show the same editable list.

insert into public.site_settings (key, value)
values (
  'faq',
  $faq${
  "items": [
    {
      "category": "Shop",
      "q": "What can I buy online?",
      "a": "Four collections under one shop: Fashion & Accessories, Personalised Gifts, Smart Home hardware, and Home & DIY."
    },
    {
      "category": "Shop",
      "q": "How do payments work?",
      "a": "Checkout is Stripe only, in GBP. You pay securely on Stripe Checkout and return to a confirmation page when payment succeeds."
    },
    {
      "category": "Shop",
      "q": "Do you deliver shop orders across the UK?",
      "a": "Yes. We ship UK-wide. Shipping is calculated at checkout. Rates can vary by postcode (for example Highlands & Islands or Northern Ireland). Once paid, you'll get an email confirmation and we fulfil from there."
    },
    {
      "category": "Orders",
      "q": "How does order tracking work?",
      "a": "Shop orders only. Go to Track order, enter your order number (from the confirmation email, usually starting VB-) and the same email you used at checkout. You'll see the order status, items, and — once we've shipped — carrier details, tracking number, and a link to track the parcel when available. Service bookings and courier jobs aren't on that page; those updates come by email or WhatsApp."
    },
    {
      "category": "Orders",
      "q": "What do the shop order statuses mean?",
      "a": "Typical flow: paid → processing (or personalising for custom pieces) → shipped → delivered. Pre-order appears when an item isn't in stock yet. Cancelled or refunded means the order won't ship (or payment was returned)."
    },
    {
      "category": "Orders",
      "q": "How will I hear from you after ordering or booking?",
      "a": "Email is the default for order receipts, ship notices, and booking confirmations. When an order ships, we email tracking details and you can also check status on the Track order page. You can continue on WhatsApp anytime."
    },
    {
      "category": "Orders",
      "q": "Who do I contact with a question?",
      "a": "Use the contact form, email hello@vivabossfusion.co.uk (or the address on Contact), or WhatsApp. Include your order number or postcode so we can find you quickly."
    },
    {
      "category": "Personalised",
      "q": "How do personalised gifts work?",
      "a": "Ready-to-customise products let you pick options (and uploads) and add to cart. More complex pieces use a custom request — we review, send a quote, then you pay via a secure link. See Artwork guidelines for how to send files and photos."
    },
    {
      "category": "Personalised",
      "q": "Will I see a proof before you engrave?",
      "a": "Yes. Before we touch your item you get a free visual proof showing how it will look. We engrave or print exactly what you approve — so check spelling, names, and dates carefully."
    },
    {
      "category": "Personalised",
      "q": "Do I need design skills or special files?",
      "a": "No. A phone photo, screenshot, logo, handwritten text, or a short description is enough — we prepare it for laser engraving. Most everyday phone photos work. If a file is too blurry or low-res, we'll say so and can rebuild it for a small extra charge when needed."
    },
    {
      "category": "Personalised",
      "q": "What can you engrave on — and what can't you?",
      "a": "Wood, leather, ceramic, anodised aluminium, acrylic, card, plus tumblers, flasks, bottles, mugs and glasses (including 360° on curved pieces). We can't process PVC, vinyl, or unknown/chlorinated plastics — they release toxic fumes and damage equipment. Full details are on Artwork guidelines."
    },
    {
      "category": "Personalised",
      "q": "Can I return a personalised item?",
      "a": "Change-of-mind returns aren't available once something is engraved or printed — it can't be resold. If we make a mistake against your approved proof, or the item arrives damaged, we'll replace or refund. Full policy: Returns & Refunds."
    },
    {
      "category": "Services",
      "q": "Where do you offer home and smart-home services?",
      "a": "UK-wide. Book with your postcode and preferred window on the services booking form; we'll confirm timing and access before we attend."
    },
    {
      "category": "Services",
      "q": "How do I book a home or smart-home service?",
      "a": "Use Book a service, tell us the job type, postcode, and preferred timing. A booking request isn't an instant confirmed visit — we confirm by email or WhatsApp first."
    },
    {
      "category": "Services",
      "q": "Can I book installation with a smart-home product?",
      "a": "Yes. Buy hardware in the Smart Home shop and request installation as an add-on where offered, or book a smart-home install separately on the services form."
    },
    {
      "category": "Services",
      "q": "What home repairs do you cover?",
      "a": "Furniture and TV installs, painting and wallpaper, door and cabinet repairs, small woodwork, tap and sink fixes, bathroom and kitchen repairs, light fittings, socket covers, smoke alarms, and more. Describe the job on the booking form."
    },
    {
      "category": "Courier",
      "q": "What courier jobs do you take?",
      "a": "Medical deliveries, legal documents, flower & event runs, and general packages for individuals and businesses — with standard, same-day, or urgent options."
    },
    {
      "category": "Courier",
      "q": "How do I book a courier?",
      "a": "Use Book a delivery with pickup, drop-off, item details, and urgency. You'll get email confirmation of the request; we confirm timing before we move. You can continue on WhatsApp anytime."
    },
    {
      "category": "Courier",
      "q": "Can I track a courier job on the Track order page?",
      "a": "No — that page is for shop orders (order number + checkout email). Courier updates come by email or WhatsApp as the job is confirmed, picked up, or delivered."
    },
    {
      "category": "Returns",
      "q": "What's your returns policy?",
      "a": "Personalised goods generally can't be returned for change of mind. Mistakes against your approved proof, or damage in transit, are covered with replacement or refund. Unused non-personalised items can usually be returned within 14 days. See Returns & Refunds for steps and timelines."
    }
  ]
}$faq$::jsonb
)
on conflict (key) do update
set value = excluded.value;
