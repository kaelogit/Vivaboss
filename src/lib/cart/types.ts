export type CartCustomValue = {
  key: string;
  label: string;
  field_type: string;
  value: string;
  price_delta_gbp?: number;
  /** Short-lived preview URL (optional) */
  file_url?: string;
  /** Durable storage path in customer-uploads */
  file_path?: string;
};

export type CartLine = {
  id: string; // stable line id
  productId: string;
  slug: string;
  name: string;
  image?: string;
  unitPriceGbp: number;
  /** Original / compare-at unit price when the product was on sale. */
  compareAtGbp?: number | null;
  quantity: number;
  customisation: CartCustomValue[];
  installationRequested: boolean;
  installationPriceGbp: number | null;
  /** True when added while product was out of stock with pre-order allowed. */
  isPreorder?: boolean;
};

export function lineUnitTotal(line: CartLine): number {
  const deltas = line.customisation.reduce(
    (sum, c) => sum + (c.price_delta_gbp ?? 0),
    0
  );
  const install =
    line.installationRequested && line.installationPriceGbp != null
      ? line.installationPriceGbp
      : 0;
  return line.unitPriceGbp + deltas + install;
}

export function lineTotal(line: CartLine): number {
  return lineUnitTotal(line) * line.quantity;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}
