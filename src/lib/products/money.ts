export function formatGbp(amount: number | string | null | undefined): string {
  const n = typeof amount === "string" ? Number(amount) : amount ?? 0;
  if (Number.isNaN(n)) return "£0.00";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n);
}

/** Compare-at only counts when higher than the live price. */
export function saleCompareAt(
  price: number,
  compareAt: number | null | undefined
): number | null {
  if (compareAt == null || Number.isNaN(compareAt)) return null;
  return compareAt > price ? compareAt : null;
}

export function saleDiscountPercent(
  price: number,
  compareAt: number | null | undefined
): number {
  const compare = saleCompareAt(price, compareAt);
  if (compare == null) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

export function saleSaveGbp(
  price: number,
  compareAt: number | null | undefined
): number {
  const compare = saleCompareAt(price, compareAt);
  if (compare == null) return 0;
  return Math.round((compare - price) * 100) / 100;
}

