import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseConfig } from "@/lib/supabase/config";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { faqItems } from "@/lib/content/marketing";
import { siteConfig } from "@/lib/site";
import type { Json } from "@/types/database";
import type { ShippingBand, ShippingConfig } from "@/lib/shipping";
import { getDefaultShippingConfig } from "@/lib/shipping";

export type ContactSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
};

export type BrandSettings = {
  name: string;
  shortName: string;
  tagline: string;
  homepageLine: string;
};

export type ShippingSettings = {
  ukWide: boolean;
  collectionEnabled: boolean;
  defaultRateGbp: number | null;
  freeOverGbp: number | null;
  bands: ShippingBand[];
};

export type NotificationsSettings = {
  adminEmails: string[];
  emailOnOrder: boolean;
  emailOnServiceJob: boolean;
  emailOnCourierJob: boolean;
  emailOnCustomRequest: boolean;
};

export type HomepageContent = {
  heroEyebrow: string;
  heroHeadline: string;
  heroSub: string;
  heroTagline: string;
  pathChooserEyebrow: string;
  pathChooserTitle: string;
  craftHeadline: string;
  craftBody: string;
};

export type FaqContent = {
  items: Array<{ category: string; q: string; a: string }>;
};

export type PagesContent = {
  aboutIntro: string;
  contactIntro: string;
  announcement: string;
};

export const SETTINGS_KEYS = [
  "contact",
  "brand",
  "shipping",
  "notifications",
] as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[number];

export const CONTENT_KEYS = ["homepage", "faq", "pages"] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

export function defaultContact(): ContactSettings {
  return {
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    email: siteConfig.contact.email,
    address: siteConfig.contact.address,
  };
}

export function defaultBrand(): BrandSettings {
  return {
    name: siteConfig.name,
    shortName: siteConfig.shortName,
    tagline: siteConfig.tagline,
    homepageLine: siteConfig.homepageLine,
  };
}

export function defaultShipping(): ShippingSettings {
  const d = getDefaultShippingConfig();
  return {
    ukWide: true,
    collectionEnabled: false,
    defaultRateGbp: d.defaultRateGbp,
    freeOverGbp: d.freeOverGbp > 0 ? d.freeOverGbp : null,
    bands: d.bands.map((b) => ({ ...b, prefixes: [...b.prefixes] })),
  };
}

export function defaultNotifications(): NotificationsSettings {
  return {
    adminEmails: [siteConfig.contact.email],
    emailOnOrder: true,
    emailOnServiceJob: true,
    emailOnCourierJob: true,
    emailOnCustomRequest: true,
  };
}

export function defaultHomepage(): HomepageContent {
  return {
    heroEyebrow: siteConfig.name,
    heroHeadline: siteConfig.shortName,
    heroSub: siteConfig.homepageLine,
    heroTagline: siteConfig.fashionPunchline,
    pathChooserEyebrow: "What are you looking for?",
    pathChooserTitle: "Three ways into Vivaboss",
    craftHeadline: "Vivaboss is a master of life.",
    craftBody:
      "Vivaboss began in 2008 with a needle, a thread, and a young craftsman turning ripped jeans into a crossbag. What started as creativity born from lack grew into a lifestyle brand shaped by culture, innovation, and honest work.",
  };
}

export function defaultFaq(): FaqContent {
  return { items: faqItems.map((i) => ({ ...i })) };
}

export function defaultPages(): PagesContent {
  return {
    aboutIntro:
      "Vivaboss Fusion Services is a lifestyle brand built from culture, creativity, and honest work. What began in 2008 with a needle, a thread, and a single handmade crossbag has grown into a modern multi-service brand serving Darlington and beyond.",
    contactIntro:
      "Questions about an order, a custom piece, a home visit, or a courier run — reach us here. Bookings also have dedicated forms if you already know what you need.",
    announcement: "",
  };
}

function asRecord(value: Json | null | undefined): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function asNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseBands(raw: unknown): ShippingBand[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const prefixes = Array.isArray(row.prefixes)
        ? row.prefixes
            .filter((p): p is string => typeof p === "string")
            .map((p) => p.trim().toUpperCase())
            .filter(Boolean)
        : typeof row.prefixes === "string"
          ? row.prefixes
              .split(/[\s,]+/)
              .map((p) => p.trim().toUpperCase())
              .filter(Boolean)
          : [];
      const rateGbp = Number(row.rateGbp);
      return {
        label: asString(row.label, "Band"),
        prefixes,
        rateGbp: Number.isFinite(rateGbp) ? rateGbp : 0,
      };
    })
    .filter((b): b is ShippingBand => Boolean(b));
}

export function parseContact(value: Json | null | undefined): ContactSettings {
  const d = defaultContact();
  const r = asRecord(value);
  return {
    phone: asString(r.phone, d.phone),
    whatsapp: asString(r.whatsapp, d.whatsapp),
    email: asString(r.email, d.email),
    address: asString(r.address, d.address),
  };
}

export function parseBrand(value: Json | null | undefined): BrandSettings {
  const d = defaultBrand();
  const r = asRecord(value);
  const legacyTagline =
    "Crafted with culture. Powered by creativity. Delivered with care.";
  const rawTagline = asString(r.tagline, d.tagline);
  return {
    name: asString(r.name, d.name),
    shortName: asString(r.shortName, d.shortName),
    tagline: rawTagline === legacyTagline ? d.tagline : rawTagline,
    homepageLine: asString(r.homepageLine, d.homepageLine),
  };
}

export function parseShipping(value: Json | null | undefined): ShippingSettings {
  const d = defaultShipping();
  const r = asRecord(value);
  const bands = parseBands(r.bands);
  return {
    ukWide: asBool(r.ukWide, d.ukWide),
    collectionEnabled: asBool(r.collectionEnabled, d.collectionEnabled),
    defaultRateGbp:
      r.defaultRateGbp === undefined
        ? d.defaultRateGbp
        : asNumberOrNull(r.defaultRateGbp),
    freeOverGbp:
      r.freeOverGbp === undefined
        ? d.freeOverGbp
        : asNumberOrNull(r.freeOverGbp),
    bands: bands.length ? bands : d.bands,
  };
}

export function parseNotifications(
  value: Json | null | undefined
): NotificationsSettings {
  const d = defaultNotifications();
  const r = asRecord(value);
  const emails = Array.isArray(r.adminEmails)
    ? r.adminEmails.filter((e): e is string => typeof e === "string")
    : typeof r.adminEmails === "string"
      ? r.adminEmails
          .split(/[,;\n]+/)
          .map((e) => e.trim())
          .filter(Boolean)
      : d.adminEmails;
  return {
    adminEmails: emails.length ? emails : d.adminEmails,
    emailOnOrder: asBool(r.emailOnOrder, d.emailOnOrder),
    emailOnServiceJob: asBool(r.emailOnServiceJob, d.emailOnServiceJob),
    emailOnCourierJob: asBool(r.emailOnCourierJob, d.emailOnCourierJob),
    emailOnCustomRequest: asBool(
      r.emailOnCustomRequest,
      d.emailOnCustomRequest
    ),
  };
}

export function parseHomepage(value: Json | null | undefined): HomepageContent {
  const d = defaultHomepage();
  const r = asRecord(value);
  const legacyHeroTagline =
    "Crafted with culture. Powered by creativity. Delivered with care.";
  const rawTagline = asString(r.heroTagline, d.heroTagline);
  return {
    heroEyebrow: asString(r.heroEyebrow, d.heroEyebrow),
    heroHeadline: asString(r.heroHeadline, d.heroHeadline),
    heroSub: asString(r.heroSub, d.heroSub),
    heroTagline:
      rawTagline === legacyHeroTagline ? d.heroTagline : rawTagline,
    pathChooserEyebrow: asString(r.pathChooserEyebrow, d.pathChooserEyebrow),
    pathChooserTitle: asString(r.pathChooserTitle, d.pathChooserTitle),
    craftHeadline: asString(r.craftHeadline, d.craftHeadline),
    craftBody: asString(r.craftBody, d.craftBody),
  };
}

export function parseFaq(value: Json | null | undefined): FaqContent {
  const r = asRecord(value);
  if (!Array.isArray(r.items)) return defaultFaq();
  const items = r.items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const q = asString(row.q, "");
      const a = asString(row.a, "");
      if (!q && !a) return null;
      return {
        category: asString(row.category, "General"),
        q,
        a,
      };
    })
    .filter(
      (i): i is { category: string; q: string; a: string } => Boolean(i)
    );
  return items.length ? { items } : defaultFaq();
}

export function parsePages(value: Json | null | undefined): PagesContent {
  const d = defaultPages();
  const r = asRecord(value);
  return {
    aboutIntro: asString(r.aboutIntro, d.aboutIntro),
    contactIntro: asString(r.contactIntro, d.contactIntro),
    announcement: asString(r.announcement, d.announcement),
  };
}

export function shippingToConfig(settings: ShippingSettings): ShippingConfig {
  const fallback = getDefaultShippingConfig();
  return {
    defaultRateGbp:
      settings.defaultRateGbp ?? fallback.defaultRateGbp,
    freeOverGbp: settings.freeOverGbp ?? 0,
    bands: settings.bands,
  };
}

/** Read a site_settings row (public anon client). Returns null if missing/unconfigured. */
export async function getPublicSetting(
  key: string
): Promise<Json | null> {
  if (!hasPublicSupabaseConfig()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return null;
    return data.value;
  } catch {
    return null;
  }
}

export async function getAdminSetting(
  key: string
): Promise<{ value: Json; updated_at: string | null } | null> {
  if (!hasAdminClient()) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value, updated_at")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return null;
  return { value: data.value, updated_at: data.updated_at };
}

export async function upsertAdminSetting(
  key: string,
  value: Json
): Promise<{ value: Json; updated_at: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" })
    .select("value, updated_at")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save setting.");
  }
  return { value: data.value, updated_at: data.updated_at };
}

export async function getPublicFaqItems() {
  const raw = await getPublicSetting("faq");
  if (!raw) return faqItems;
  return parseFaq(raw).items;
}

export async function getPublicHomepage(): Promise<HomepageContent> {
  const raw = await getPublicSetting("homepage");
  return parseHomepage(raw);
}

export async function getPublicPages(): Promise<PagesContent> {
  const raw = await getPublicSetting("pages");
  return parsePages(raw);
}
