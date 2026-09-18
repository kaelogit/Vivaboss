import { siteConfig } from "@/lib/site";

export const primaryNav = [
  { label: "Shop", href: "/shop" },
  { label: "Services", href: "/services" },
  { label: "Courier", href: "/courier" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const shopCategories = [
  {
    slug: "fashion",
    label: "Fashion & Accessories",
    blurb: "Handmade leather, shoes, and modern African-inspired style.",
    href: "/shop/fashion",
  },
  {
    slug: "personalised",
    label: "Personalised Gifts",
    blurb: "Engraving, custom tags, memorial and anniversary pieces.",
    href: "/shop/personalised",
  },
  {
    slug: "smart-home",
    label: "Smart Home",
    blurb: "Locks, cameras, lighting, sensors — ready for UK homes.",
    href: "/shop/smart-home",
  },
  {
    slug: "home-diy",
    label: "Home & DIY",
    blurb: "Equipment and essentials for home improvement.",
    href: "/shop/home-diy",
  },
] as const;

export const serviceArms = [
  {
    slug: "home",
    label: "Home Services",
    blurb: "Repairs, installs, painting, and everyday fixes.",
    href: "/services/home",
  },
  {
    slug: "smart-home",
    label: "Smart Home Services",
    blurb: "Setup and installation for a safer, smarter home.",
    href: "/services/smart-home",
  },
] as const;

/** Desktop / mobile Services dropdown */
export const servicesNavLinks = [
  {
    label: "All services",
    blurb: "Home repairs and smart-home setup under one standard.",
    href: "/services",
  },
  ...serviceArms.map((arm) => ({
    label: arm.label,
    blurb: arm.blurb,
    href: arm.href,
  })),
  {
    label: "Book a service",
    blurb: "Tell us the job and postcode — we confirm by email.",
    href: "/services/book",
  },
] as const;

/** Desktop / mobile Courier dropdown */
export const courierNavLinks = [
  {
    label: "Courier overview",
    blurb: "Medical, legal, flowers & events, and general delivery.",
    href: "/courier",
  },
  {
    label: "Medical deliveries",
    blurb: "Samples, medicines, and time-critical medical items.",
    href: "/courier/book?vertical=medical",
  },
  {
    label: "Flower & event deliveries",
    blurb: "Delicate bouquets and event pieces, handled carefully.",
    href: "/courier/book?vertical=flowers_events",
  },
  {
    label: "Legal document delivery",
    blurb: "Contracts and urgent paperwork with clear handoff.",
    href: "/courier/book?vertical=legal",
  },
  {
    label: "General delivery",
    blurb: "Everyday packages for individuals and businesses.",
    href: "/courier/book?vertical=general",
  },
  {
    label: "Book a delivery",
    blurb: "Pickup, drop-off, urgency — we confirm before we move.",
    href: "/courier/book",
  },
] as const;

export const pathChooser = [
  {
    key: "shop",
    title: "Shop",
    blurb:
      "Fashion, personalised gifts, smart-home products & home equipment.",
    href: "/shop",
    cta: "Explore Shop",
  },
  {
    key: "services",
    title: "Home & Smart Services",
    blurb: "Repairs, installations, smart-home setup and home improvements.",
    href: "/services",
    cta: "Explore Services",
  },
  {
    key: "courier",
    title: "Courier",
    blurb: "Fast, safe delivery for individuals and businesses across the UK.",
    href: "/courier",
    cta: "Explore Courier",
  },
] as const;

export const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      ...shopCategories.map((c) => ({ label: c.label, href: c.href })),
    ],
  },
  {
    title: "Services",
    links: [
      { label: "All services", href: "/services" },
      { label: "Home repairs", href: "/services/home" },
      { label: "Smart home setup", href: "/services/smart-home" },
      { label: "Book a service", href: "/services/book" },
    ],
  },
  {
    title: "Courier",
    links: [
      { label: "Courier overview", href: "/courier" },
      { label: "Book a delivery", href: "/courier/book" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Reviews", href: "/reviews" },
      { label: "FAQ", href: "/faq" },
      { label: "Artwork guidelines", href: "/artwork-guidelines" },
      { label: "Track order", href: "/order/track" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Returns", href: "/returns" },
    ],
  },
] as const;

/** Build a wa.me URL with optional prefilled message */
export function whatsappHref(message?: string) {
  const digits = siteConfig.contact.whatsapp.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
