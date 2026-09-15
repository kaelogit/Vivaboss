/** Stock / pre-order helpers for storefront + checkout. */

export type Stockable = {
  track_stock: boolean;
  stock_quantity: number | null;
  allow_preorder?: boolean | null;
};

export function isOutOfStock(product: Stockable): boolean {
  if (!product.track_stock) return false;
  return (product.stock_quantity ?? 0) < 1;
}

/** OOS and admin allows pre-order purchases. */
export function canPreorder(product: Stockable): boolean {
  return isOutOfStock(product) && product.allow_preorder !== false;
}

/** OOS and admin has disabled pre-order — not buyable. */
export function isUnavailable(product: Stockable): boolean {
  return isOutOfStock(product) && product.allow_preorder === false;
}

export const PREORDER_LEAD = "10–14 days";
