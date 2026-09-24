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
  postcode?: string | null
) {
  const config = await loadShippingConfig();
  const result = resolveShippingGbp(subtotal, postcode, config);
  return {
    shippingGbp: result.amount,
    bandLabel: result.bandLabel,
    totalGbp: Math.round((subtotal + result.amount) * 100) / 100,
  };
}
