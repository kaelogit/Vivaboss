/** Public marketing copy — refined from the Vivaboss client script. */

export const brandLines = {
  attract: "You don’t have to be born beautiful to be wildly attractive.",
  tagline: "Craftsmanship that turns heads. Style that holds attention.",
  fashion: "People will stare. Make it worth their while.",
  fashionSub: "Made to look good. Made to feel special. Made to last.",
  masteredLife: "The Mastered Life",
  founded: "Crafted with culture. Powered by innovation. Built from honest work.",
} as const;

/** Homepage founder story — short version */
export const homepageFounderStory = {
  eyebrow: "Since 2008",
  headline: "Vivaboss is a master of life.",
  paragraphs: [
    "Vivaboss began in 2008 with a needle, a thread, and a young craftsman turning ripped jeans into a crossbag. What started as creativity born from lack grew into a lifestyle brand shaped by culture, innovation, and honest work. From denim to Ankara, from bags to shoes, from accessories to tech-infused craftsmanship, the vision expanded naturally — driven by authenticity and customer demand.",
    "Over the years, Founder & Creative Director Habeeb Adewale Adesokan has trained 800+ creators across communities. Today, Vivaboss Fusion Services blends handmade fashion with engraving, smart home installations, DIY repairs, and courier support — all delivered with care, precision, and purpose.",
  ],
  closing: "A fusion of culture, creativity, and innovation.",
} as const;

/** Full About page narrative */
export const aboutPageStory = {
  intro:
    "Vivaboss Fusion Services is a lifestyle brand built from culture, creativity, and honest work. What began in 2008 with a needle, a thread, and a single handmade crossbag has grown into a modern multi-service brand serving Darlington and beyond.",
  paragraphs: [
    "Our roots are in craftsmanship. From turning ripped denim into art to shaping bold Ankara prints into luxury pieces, we founded Vivaboss on the belief that creativity can rise from any circumstance. Over the years, our handmade bags, shoes, and accessories earned recognition for their longevity, authenticity, and uniqueness — inspiring the name VIVABOSS, meaning The Mastered Life.",
    "As demand grew, so did our vision. We expanded from fashion into tech-infused craftsmanship, introducing NFC authenticity tags, anti-counterfeit verification, smart keyholders, RFID-blocking pouches, and wearable products embedded with protective technology — a fusion of heritage craft and modern innovation.",
    "Vivaboss has also evolved into a multi-service brand that supports everyday life. We offer engraving, smart home installations, DIY home repairs, and courier services — all delivered with the same care, precision, and reliability that shaped our early craft.",
    "Our commitment to empowerment is part of our identity. To date, we have trained over 800+ people in bag-making and shoemaking, helping new creators build skills, confidence, and opportunity.",
  ],
  closing:
    "Today, Vivaboss Fusion Services stands as a brand where culture meets technology, where creativity meets functionality, and where every product and service is intentional, personal, and beautifully done.",
  signature: "This is Vivaboss — a fusion of everything we’ve built, and everything we’re becoming.",
} as const;

/** Founder profile — About page */
export const founderProfile = {
  name: "Habeeb Adewale Adesokan",
  role: "Founder & Creative Director, Vivaboss Fusion Services",
  eyebrow: "Founder",
  bio: [
    "Habeeb Adewale Adesokan is a multi-disciplinary craftsman, designer, and innovator whose work blends African artistry with modern technology. His journey began in 2008 with a needle, a thread, and a crossbag made from ripped jeans — a moment that transformed creativity born from lack into a lifelong mission of purposeful craftsmanship.",
    "From denim to Ankara, from handmade bags to custom shoes, Habeeb built Vivaboss as a brand rooted in authenticity, culture, and honest work. Over the years, he has trained 800+ creators across communities, empowering people with skills that open doors and build confidence.",
    "As his vision expanded, so did the brand. Today, Habeeb leads Vivaboss Fusion Services, a multi-service company offering handmade fashion, engraving, smart home installations, DIY repairs, and courier support. His approach is simple: create meaningful products, deliver reliable services, and infuse every project with intention, precision, and innovation.",
    "Habeeb’s work is shaped by culture, elevated by technology, and grounded in real everyday value. Vivaboss is his mastered life — and the movement he continues to build.",
  ],
} as const;

/** Founder’s statement — “What I Have to Say About Vivaboss” */
export const founderStatement = {
  eyebrow: "Founder’s statement",
  title: "What I have to say about Vivaboss",
  paragraphs: [
    "Vivaboss is more than a brand to me — it’s a story of turning scarcity into mastery. I started with nothing but creativity and determination, and every step since then has been built on honest work, cultural identity, and the desire to create things that truly matter.",
    "Vivaboss represents the fusion of everything I believe in: craftsmanship, innovation, reliability, and purpose. Whether I’m making a bag, engraving a gift, installing a smart home device, or helping someone with a simple repair, my goal is always the same — to deliver value that feels personal, intentional, and built to last.",
    "This brand carries my journey, my culture, my skills, and my evolution. It’s a lifestyle, a service, a craft, and a commitment to excellence. Vivaboss is the mastered life, and I’m proud of what it has become and what it continues to grow into.",
  ],
  signature: "— Habeeb Adewale Adesokan",
} as const;

/** @deprecated Prefer founderProfile — kept for any lingering imports */
export const founderStoryLong = {
  eyebrow: founderProfile.eyebrow,
  title: founderProfile.name,
  lead: founderProfile.role,
  paragraphs: founderProfile.bio,
  closing: "Vivaboss is the mastered life — and the movement he continues to build.",
} as const;

export const aboutArms = [
  {
    title: "Handmade fashion",
    body: "Leather bags, shoes, clothing and accessories inspired by African culture, creativity, and modern style — made with care and built to last.",
    href: "/shop/fashion",
    cta: "Shop fashion",
  },
  {
    title: "Personalised gifts",
    body: "Names, pictures, memories and special moments turned into pieces you keep forever — engraving, metal tags, leather keyholders, memorials.",
    href: "/shop/personalised",
    cta: "Shop personalised",
  },
  {
    title: "Smart home",
    body: "Locks, cameras, doorbells, lighting and sensors — buy the hardware online, then book professional setup when you want help.",
    href: "/shop/smart-home",
    cta: "Shop smart home",
  },
  {
    title: "Home services",
    body: "Repairs, installs, painting, plumbing fixes and everyday improvements — we come to you across the UK.",
    href: "/services/home",
    cta: "Explore home services",
  },
  {
    title: "Courier",
    body: "Medical, legal, flowers & events, and general delivery — handled carefully, confirmed quickly, moved on time.",
    href: "/courier",
    cta: "Explore courier",
  },
] as const;

export const serviceHowItWorks = [
  {
    step: "01",
    title: "Tell us the job",
    body: "Share the service type, postcode, photos, and preferred window on the booking form — or WhatsApp if that’s easier.",
  },
  {
    step: "02",
    title: "We confirm",
    body: "Our team reviews access, timing, and materials. You’ll get email confirmation and a follow-up if we need anything else.",
  },
  {
    step: "03",
    title: "We attend",
    body: "We arrive prepared, complete the work carefully, and leave your home looking and working better than we found it.",
  },
] as const;

export const courierHowItWorks = [
  {
    step: "01",
    title: "Request a run",
    body: "Add pickup and drop-off, item type, urgency, and any handling notes. Photos help for delicate or time-critical items.",
  },
  {
    step: "02",
    title: "We confirm timing",
    body: "We check the route and window, then confirm by email — with WhatsApp if you prefer a live chat.",
  },
  {
    step: "03",
    title: "Picked up & delivered",
    body: "Handled with care from door to door — medical, legal, floral, or everyday packages across the UK.",
  },
] as const;

export const courierCare = [
  "Careful handling for delicate and time-sensitive items",
  "Clear pickup and drop-off details before we move",
  "Urgency options: standard, same-day, or urgent",
  "UK-wide coverage for individuals and businesses",
] as const;

export const homeServiceItems = [
  "Furniture, shelf, TV, and mirror installation",
  "Painting and decorating",
  "Wallpaper installation",
  "Door, hinge, and cabinet repairs",
  "Small woodwork repairs",
  "Fixing leaking taps and blocked sinks",
  "Bathroom and kitchen repairs",
  "Installing lights and changing light fittings",
  "Replacing electrical socket covers",
  "Installing smoke alarms",
] as const;

export const smartHomeServiceItems = [
  "Robot vacuum and floor cleaner setup",
  "Smart doorbells",
  "Smart door locks",
  "Security cameras",
  "Better Wi‑Fi setup",
  "Decorative and mood lighting",
  "Smart bulbs",
  "Movement sensors",
  "Smart plugs",
] as const;

export const courierVerticals = [
  {
    title: "Medical deliveries",
    blurb: "Samples, medicines, testing kits, and important medical documents — moved with care and urgency when it matters.",
    items: [
      "Medical samples",
      "Medicines and prescriptions",
      "Testing kits",
      "Important medical documents",
    ],
    href: "/courier/book?vertical=medical",
  },
  {
    title: "Flower & event deliveries",
    blurb: "Same-day options, decorations, and delicate items that need a steady hand for celebrations and events.",
    items: [
      "Same-day delivery",
      "Flower and decoration delivery",
      "Careful handling of delicate items",
      "Event delivery support",
    ],
    href: "/courier/book?vertical=flowers_events",
  },
  {
    title: "Legal document delivery",
    blurb: "Contracts, urgent paperwork, and documents that can’t wait in a queue — tracked by our ops team.",
    items: [
      "Important legal documents",
      "Contracts",
      "Urgent paperwork",
    ],
    href: "/courier/book?vertical=legal",
  },
  {
    title: "General delivery",
    blurb: "Everyday packages for individuals and businesses when you need a reliable UK courier without the fuss.",
    items: [
      "Business packages",
      "Personal parcels",
      "Time-sensitive handovers",
    ],
    href: "/courier/book?vertical=general",
  },
] as const;

export type FaqItem = { q: string; a: string; category: string };

export const faqItems: FaqItem[] = [
  {
    category: "Shop",
    q: "Do you deliver shop orders across the UK?",
    a: "Yes. Vivaboss ships UK-wide. Shipping is calculated at checkout in GBP. Once an order is paid, you’ll receive email confirmation and we fulfil from there.",
  },
  {
    category: "Shop",
    q: "What can I buy online?",
    a: "Four collections: Fashion & Accessories, Personalised Gifts, Smart Home hardware, and Home & DIY. All categories sell online under one Vivaboss shop.",
  },
  {
    category: "Shop",
    q: "How do payments work?",
    a: "Checkout is Stripe only, in GBP. You’ll pay securely on Stripe Checkout and land back on a confirmation page when payment succeeds.",
  },
  {
    category: "Personalised",
    q: "How do personalised gifts work?",
    a: "Simple custom products let you configure options (and uploads) and add straight to cart. More complex or approval-required pieces use a custom request — we review, then quote before you pay.",
  },
  {
    category: "Personalised",
    q: "What kinds of engraving do you offer?",
    a: "Name and message engraving, personalised metal tags, custom leather keyholders, pictures on wood, portraits on metal, memorial and anniversary gifts — each made with care and attention to detail.",
  },
  {
    category: "Services",
    q: "Where do you offer home and smart-home services?",
    a: "UK-wide. Book with your postcode and preferred window; we’ll confirm timing and access before we attend.",
  },
  {
    category: "Services",
    q: "Can I book installation with a smart-home product?",
    a: "Yes. Buy hardware in the Smart Home shop and request installation as an add-on where offered, or book a smart-home install separately on the services booking form.",
  },
  {
    category: "Services",
    q: "What home repairs do you cover?",
    a: "Furniture and TV installs, painting and wallpaper, door and cabinet repairs, small woodwork, tap and sink fixes, bathroom and kitchen repairs, light fittings, socket covers, smoke alarms, and more. Tell us the job on the booking form.",
  },
  {
    category: "Courier",
    q: "What courier jobs do you take?",
    a: "Medical deliveries, legal documents, flower & event runs, and general packages for individuals and businesses — with standard, same-day, or urgent options.",
  },
  {
    category: "Courier",
    q: "How do I book a courier?",
    a: "Use /courier/book with pickup, drop-off, item details, and urgency. You’ll get email confirmation, and you can continue on WhatsApp anytime.",
  },
  {
    category: "Orders",
    q: "How will I hear from you after booking or ordering?",
    a: "Email is the default for order receipts and booking confirmations. You can also continue on WhatsApp, and our team can email or message you from the job or order record.",
  },
  {
    category: "Orders",
    q: "Who do I contact with a question?",
    a: "Use the contact form, email hello@vivabossfusion.co.uk (or the address shown on Contact), or WhatsApp. Include your order number or postcode so we can find you quickly.",
  },
];

export const contactTopics = [
  { value: "general", label: "General enquiry" },
  { value: "shop", label: "Shop / order" },
  { value: "personalised", label: "Personalised / engraving" },
  { value: "services", label: "Home / smart services" },
  { value: "courier", label: "Courier" },
  { value: "other", label: "Something else" },
] as const;
