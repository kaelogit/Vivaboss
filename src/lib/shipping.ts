import { postcodeOutward } from "@/lib/uk/postcode";

export type ShippingBand = {
  /** Match outward codes starting with these prefixes (uppercase) */
  prefixes: string[];
  label: string;
  rateGbp: number;
};

export type ShippingConfig = {
  defaultRateGbp: number;
  freeOverGbp: number;
  bands: ShippingBand[];
};

const DEFAULT_CONFIG: ShippingConfig = {
  defaultRateGbp: Number(process.env.SHIPPING_GBP ?? "4.99") || 4.99,
  freeOverGbp: Number(process.env.SHIPPING_FREE_OVER_GBP ?? "0") || 0,
  bands: [
    {
      label: "Scottish Highlands & Islands",
      prefixes: ["IV", "HS", "KA27", "KA28", "KW", "PA20", "PA41", "PA42", "PA43", "PA44", "PA45", "PA46", "PA47", "PA48", "PA49", "PA60", "PA61", "PA62", "PA63", "PA64", "PA65", "PA66", "PA67", "PA68", "PA69", "PA70", "PA71", "PA72", "PA73", "PA74", "PA75", "PA76", "PA77", "PA78", "PH19", "PH20", "PH21", "PH22", "PH23", "PH24", "PH25", "PH26", "PH30", "PH31", "PH32", "PH33", "PH34", "PH35", "PH36", "PH37", "PH38", "PH39", "PH40", "PH41", "PH42", "PH43", "PH44", "PH49", "PH50", "ZE"],
      rateGbp: 9.99,
    },
    {
      label: "Northern Ireland",
      prefixes: ["BT"],
      rateGbp: 7.99,
    },
  ],
};

export function getDefaultShippingConfig(): ShippingConfig {
  return DEFAULT_CONFIG;
}

export function resolveShippingGbp(
  subtotal: number,
  postcode: string | null | undefined,
  config: ShippingConfig = DEFAULT_CONFIG
): { amount: number; bandLabel: string | null } {
  if (config.freeOverGbp > 0 && subtotal >= config.freeOverGbp) {
    return { amount: 0, bandLabel: "Free shipping" };
  }

  const outward = postcode ? postcodeOutward(postcode).toUpperCase() : "";
  if (outward) {
    for (const band of config.bands) {
      if (
        band.prefixes.some(
          (p) => outward === p || outward.startsWith(p)
        )
      ) {
        return { amount: band.rateGbp, bandLabel: band.label };
      }
    }
  }

  return { amount: config.defaultRateGbp, bandLabel: null };
}
