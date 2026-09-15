/** Local marketing assets in /public/marketing */

export const marketingImages = {
  hero: {
    primary: "/marketing/hero-a-craft-home-delivery.jpg",
    alternate: "/marketing/hero-b-craft-fashion-home.jpg",
  },
  craft: {
    workshop: "/marketing/craft-a1-workshop.jpg",
    materials: "/marketing/craft-a2-materials.jpg",
    fashionBag: "/marketing/craft-a3-fashion-bag.jpg",
    engraving: "/marketing/craft-a4-engraving.jpg",
    workshopAlt: "/marketing/craft-workshop.jpg",
  },
  shop: {
    fashion: "/marketing/shop-p1-leather-bag.jpg",
    shoes: "/marketing/shop-p2-leather-shoes.jpg",
    personalised: "/marketing/shop-p3-personalised-gift.jpg",
    engraving: "/marketing/shop-p4-photo-engraving.jpg",
    smartHome: "/marketing/smart-sh1-product-collection.jpg",
  },
  services: {
    tv: "/marketing/service-s1-tv-install.jpg",
    painting: "/marketing/service-s2-painting.jpg",
    plumbing: "/marketing/service-s3-plumbing.jpg",
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
  fashion: marketingImages.shop.shoes,
  personalised: marketingImages.shop.engraving,
  "smart-home": marketingImages.shop.smartHome,
  "home-diy": marketingImages.services.painting,
};

/** Homepage shop tiles — prefer product-forward shots */
export const shopTileImages: Record<string, string> = {
  fashion: marketingImages.shop.fashion,
  personalised: marketingImages.shop.personalised,
  "smart-home": marketingImages.shop.smartHome,
  "home-diy": marketingImages.services.painting,
};

export const homeServiceGallery = [
  {
    src: marketingImages.services.tv,
    alt: "TV and furniture installation in a UK home",
  },
  {
    src: marketingImages.services.painting,
    alt: "Painting and decorating finish",
  },
  {
    src: marketingImages.services.plumbing,
    alt: "Bathroom and plumbing repair",
  },
  {
    src: marketingImages.services.lighting,
    alt: "Lighting and fittings install",
  },
  {
    src: marketingImages.services.smokeAlarm,
    alt: "Smoke alarm installation",
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
