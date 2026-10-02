import { hasAdminClient } from "@/lib/supabase/admin";
import {
  getAdminSetting,
  parseShipping,
  shippingToConfig,
} from "@/lib/content/siteSettings";
import {
  getDefaultShippingConfig,
  resolveShippingGbp,
  type ShippingConfig,
} from "@/lib/shipping";
import {
  loadShippingSettings,
  type FulfillmentMethod,
} from "@/lib/shipping/fulfillment";

export async function loadShippingConfig(): Promise<ShippingConfig> {
  if (!hasAdminClient()) return getDefaultShippingConfig();
  try {
    const row = await getAdminSetting("shipping");
    if (row?.value) return shippingToConfig(parseShipping(row.value));
  } catch {
    /* fall through to defaults */
  }
  return getDefaultShippingConfig();
}

/** Same maths as checkout — postcode optional (standard UK rate when omitted). */
export async function quoteUkShipping(
  subtotal: number,
  postcode?: string | null,
  method: FulfillmentMethod = "delivery"
) {
  if (method === "collection") {
    const settings = await loadShippingSettings();
    if (!settings.collectionEnabled) {
      return {
        shippingGbp: 0,
        bandLabel: null as string | null,
        totalGbp: Math.round(subtotal * 100) / 100,
        method: "delivery" as const,
        collectionEnabled: false,
      };
    }
    return {
      shippingGbp: 0,
      bandLabel: "Click & collect",
      totalGbp: Math.round(subtotal * 100) / 100,
      method: "collection" as const,
      collectionEnabled: true,
    };
  }

  const config = await loadShippingConfig();
  const settings = await loadShippingSettings();
  const result = resolveShippingGbp(subtotal, postcode, config);
  return {
    shippingGbp: result.amount,
    bandLabel: result.bandLabel,
    totalGbp: Math.round((subtotal + result.amount) * 100) / 100,
    method: "delivery" as const,
    collectionEnabled: settings.collectionEnabled,
  };
}
