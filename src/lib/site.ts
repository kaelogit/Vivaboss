/** Site-wide config. Env overrides win when set. */

const phone =
  process.env.NEXT_PUBLIC_PHONE?.trim() || "+44 7979481352";
const whatsapp =
  process.env.NEXT_PUBLIC_WHATSAPP_E164?.trim() || "+44 7979481352";
const email =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
  "hello@vivabossfusion.co.uk";

export const siteConfig = {
  name: "Vivaboss Fusion Services",
  shortName: "Vivaboss",
  domain: "vivabossfusion.co.uk",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://vivabossfusion.co.uk",
  /** Short service-arms cue under the brand. */
  homepageLine: "Craft. Home. Delivery.",
  /** Brand promise — footer / supporting copy. */
  tagline: "Craftsmanship that turns heads. Style that holds attention.",
  /** Owner mantra — hero supporting line + footer signature. */
  fashionPunchline: "People will stare. Make it worth their while.",
  contact: {
    phone,
    whatsapp,
    email,
    address: "United Kingdom",
  },
  currency: "GBP" as const,
  locale: "en-GB" as const,
};

/** True when WhatsApp/phone look like real client values. */
export function isContactLive() {
  const wa = siteConfig.contact.whatsapp.replace(/\D/g, "");
  const ph = siteConfig.contact.phone.replace(/\D/g, "");
  const waOk = wa.length >= 10 && !/^44?0+$/.test(wa);
  const phOk = ph.length >= 10 && !/^44?0+$/.test(ph);
  return waOk || phOk;
}

export function isWhatsAppLive() {
  const wa = siteConfig.contact.whatsapp.replace(/\D/g, "");
  return wa.length >= 10 && !/^44?0+$/.test(wa);
}
