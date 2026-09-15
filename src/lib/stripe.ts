import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export function hasStripe(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

import { getDefaultShippingConfig, resolveShippingGbp } from "@/lib/shipping";
import type { ShippingConfig } from "@/lib/shipping";

/** UK shipping — flat + optional postcode bands */
export function getShippingGbp(
  subtotal: number,
  postcode?: string | null,
  config: ShippingConfig = getDefaultShippingConfig()
): number {
  return resolveShippingGbp(subtotal, postcode, config).amount;
}

export function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VB-${stamp}-${rand}`;
}

export function toPence(gbp: number): number {
  return Math.round(gbp * 100);
}
