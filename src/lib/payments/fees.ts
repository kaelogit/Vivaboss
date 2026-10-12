/** Display-only Stripe fee estimates (business absorbs — not added to charge). */

import { formatGbp } from "@/lib/products/money";

export const CARD_FEE_RATE = 0.015;
export const CARD_FEE_FIXED_GBP = 0.2;

export const KLARNA_FEE_RATE = 0.045;
export const KLARNA_FEE_FIXED_GBP = 0.2;

function roundGbp(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Estimated UK card fee: 1.5% + £0.20 */
export function cardFeeGbp(amountGbp: number): number {
  if (!Number.isFinite(amountGbp) || amountGbp <= 0) return 0;
  return roundGbp(amountGbp * CARD_FEE_RATE + CARD_FEE_FIXED_GBP);
}

/** Estimated Klarna fee: 4.5% + £0.20 */
export function klarnaFeeGbp(amountGbp: number): number {
  if (!Number.isFinite(amountGbp) || amountGbp <= 0) return 0;
  return roundGbp(amountGbp * KLARNA_FEE_RATE + KLARNA_FEE_FIXED_GBP);
}

/** Plain-text note for emails / WhatsApp (optional amount for concrete estimates). */
export function paymentFeeTransparencyText(amountGbp?: number | null): string {
  if (amountGbp != null && Number.isFinite(amountGbp) && amountGbp > 0) {
    return (
      `Estimated Stripe fees (absorbed by Vivaboss — you still pay ${formatGbp(amountGbp)}): ` +
      `card about ${formatGbp(cardFeeGbp(amountGbp))} (1.5% + £0.20); ` +
      `Klarna about ${formatGbp(klarnaFeeGbp(amountGbp))} (4.5% + £0.20).`
    );
  }
  return (
    "Card and Klarna show different estimated Stripe processing costs " +
    "(card about 1.5% + £0.20; Klarna about 4.5% + £0.20). " +
    "Vivaboss absorbs those fees — the amount due stays the same."
  );
}
