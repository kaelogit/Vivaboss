import {
  defaultShipping,
  getAdminSetting,
  getPublicContact,
  isPlaceholderAddress,
  parseShipping,
  type ShippingSettings,
} from "@/lib/content/siteSettings";
import { hasAdminClient } from "@/lib/supabase/admin";
import { assertUkPostcode, isValidUkPostcode } from "@/lib/uk/postcode";

export type FulfillmentMethod = "delivery" | "collection";

export type CollectionPoint = {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  label: string;
};

/** Fallback when contact address has no usable UK postcode. */
const FALLBACK_COLLECTION = {
  line1: "134 Clifton Road",
  city: "Darlington",
  postcode: "DL1 5DY",
} as const;

export async function loadShippingSettings(): Promise<ShippingSettings> {
  if (!hasAdminClient()) return defaultShipping();
  try {
    const row = await getAdminSetting("shipping");
    if (row?.value) return parseShipping(row.value);
  } catch {
    /* defaults */
  }
  return defaultShipping();
}

function extractUkPostcode(text: string): string | null {
  const match = text
    .toUpperCase()
    .match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/);
  if (!match) return null;
  try {
    return assertUkPostcode(match[1]);
  } catch {
    return null;
  }
}

/** Resolve the click & collect point from contact settings. */
export async function resolveCollectionPoint(): Promise<CollectionPoint> {
  const contact = await getPublicContact();
  const raw = contact.address.trim();
  const postcodeFromAddress = extractUkPostcode(raw);

  if (!raw || isPlaceholderAddress(raw)) {
    return {
      addressLine1: FALLBACK_COLLECTION.line1,
      addressLine2: "Vivaboss Fusion — click & collect",
      city: FALLBACK_COLLECTION.city,
      postcode: FALLBACK_COLLECTION.postcode,
      label: `${FALLBACK_COLLECTION.line1}, ${FALLBACK_COLLECTION.city} ${FALLBACK_COLLECTION.postcode}`,
    };
  }

  if (postcodeFromAddress && isValidUkPostcode(postcodeFromAddress)) {
    const withoutPc = raw
      .replace(new RegExp(postcodeFromAddress.replace(/\s+/g, "\\s*"), "i"), "")
      .replace(/,\s*,/g, ",")
      .replace(/,\s*$/, "")
      .trim();
    const parts = withoutPc
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const city =
      parts.length > 1 ? parts[parts.length - 1]! : FALLBACK_COLLECTION.city;
    const line1 = parts[0] || FALLBACK_COLLECTION.line1;
    const line2 =
      parts.length > 2 ? parts.slice(1, -1).join(", ") : null;
    return {
      addressLine1: line1,
      addressLine2: line2,
      city,
      postcode: postcodeFromAddress,
      label: raw,
    };
  }

  return {
    addressLine1: raw,
    addressLine2: "Vivaboss Fusion — click & collect",
    city: FALLBACK_COLLECTION.city,
    postcode: FALLBACK_COLLECTION.postcode,
    label: `${raw} · ${FALLBACK_COLLECTION.city} ${FALLBACK_COLLECTION.postcode}`,
  };
}
