/** Local marketing assets in /public/marketing */

export const marketingImages = {
  hero: {
    primary: "/marketing/hero-a-craft-home-delivery.jpg",
    /** Homepage fashion band — shoes (distinct from bag campaign shots) */
    alternate: "/marketing/fashion-hero-shoes.jpg",
  },
  craft: {
    workshop: "/marketing/craft-a1-workshop.jpg",
    materials: "/marketing/craft-a2-materials.jpg",
    fashionBag: "/marketing/craft-a3-fashion-bag.jpg",
    engraving: "/marketing/craft-a4-engraving.jpg",
    workshopAlt: "/marketing/craft-workshop.jpg",
    africaClock: "/marketing/craft-africa-clock.jpg",
    campaignTrio: "/marketing/fashion-campaign-trio.jpg",
    shoes: "/marketing/fashion-shoes.jpg",
  },
  founder: "/marketing/founder-habeeb.jpg",
  shop: {
    /** Homepage / shop tiles — Ankara bags lifestyle */
    fashion: "/marketing/fashion-bags-set.jpg",
    /** Fashion category header */
    fashionHero: "/marketing/fashion-hero-shoes.jpg",
    /** Shop index intro */
    fashionCampaign: "/marketing/fashion-hero-campaign.jpg",
    shoes: "/marketing/shop-p2-leather-shoes.jpg",
    /** Personalised tile + category */
    personalised: "/marketing/shop-p3-personalised-gift.jpg",
    engraving: "/marketing/shop-p4-photo-engraving.jpg",
    giftClock: "/marketing/gift-africa-clock.jpg",
    smartHome: "/marketing/smart-sh1-product-collection.jpg",
    leatherBag: "/marketing/shop-p1-leather-bag.jpg",
  },
  services: {
    /** Real Vivaboss job photos */
    tv: "/marketing/service-real-tv.jpg",
    tvHero: "/marketing/service-hero-tv.jpg",
    painting: "/marketing/service-real-plaster.jpg",
    paintingHero: "/marketing/service-hero-plaster.jpg",
    plumbing: "/marketing/service-real-plumbing.jpg",
    plumbingHero: "/marketing/service-hero-plumbing.jpg",
    furniture: "/marketing/service-real-furniture.jpg",
    furnitureHero: "/marketing/service-hero-furniture.jpg",
    sofa: "/marketing/service-real-sofa.jpg",
    smartLock: "/marketing/service-s4-smart-lock.jpg",
    lighting: "/marketing/service-s5-lighting.jpg",
    smokeAlarm: "/marketing/service-s6-smoke-alarm.jpg",
  },
  courier: {
    medical: "/marketing/courier-c1-medical.jpg",
    flowers: "/marketing/courier-c2-flowers.jpg",
    legal: "/marketing/courier-c3-legal.jpg",
  },
  ecosystem: "/marketing/ecosystem-f1-vivaboss.jpg",
} as const;

export const shopCategoryImages: Record<string, string> = {
  fashion: marketingImages.shop.fashionHero,
  personalised: marketingImages.shop.giftClock,
  "smart-home": marketingImages.shop.smartHome,
  "home-diy": marketingImages.services.furnitureHero,
};

/** Homepage + shop collection tiles — one unique shot per collection */
export const shopTileImages: Record<string, string> = {
  fashion: marketingImages.shop.fashion,
  personalised: marketingImages.shop.personalised,
  "smart-home": marketingImages.shop.smartHome,
  "home-diy": marketingImages.services.furniture,
};

export const homeServiceGallery = [
  {
    src: marketingImages.services.tv,
    alt: "TV wall mount install in a UK home",
  },
  {
    src: marketingImages.services.sofa,
    alt: "Sofa assembly in a living room",
  },
  {
    src: marketingImages.services.plumbing,
    alt: "Under-sink plumbing repair",
  },
  {
    src: marketingImages.services.painting,
    alt: "Wall repair and plastering",
  },
  {
    src: marketingImages.services.furniture,
    alt: "Furniture assembly with drill and level",
  },
] as const;

export const smartHomeGallery = [
  {
    src: marketingImages.services.smartLock,
    alt: "Smart door lock already fitted",
  },
  {
    src: marketingImages.shop.smartHome,
    alt: "Smart home product collection",
  },
  {
    src: marketingImages.services.lighting,
    alt: "Decorative and mood lighting setup",
  },
] as const;

export const courierVerticalImages: Record<string, string> = {
  "Medical deliveries": marketingImages.courier.medical,
  "Flower & event deliveries": marketingImages.courier.flowers,
  "Legal document delivery": marketingImages.courier.legal,
};
