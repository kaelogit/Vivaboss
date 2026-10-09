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
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

/** Stripe Checkout only accepts absolute https image URLs. */
export function stripeSafeImageUrl(
  value: string | null | undefined
): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
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
