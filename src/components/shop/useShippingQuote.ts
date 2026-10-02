"use client";

import { useEffect, useState } from "react";
import { isValidUkPostcode } from "@/lib/uk/postcode";

export type FulfillmentMethod = "delivery" | "collection";

export type ShippingQuote = {
  shippingGbp: number;
  bandLabel: string | null;
  totalGbp: number;
  postcodeApplied: boolean;
  method: FulfillmentMethod;
  collectionEnabled: boolean;
  collectionLabel: string | null;
};

/** Live shipping quote matching server checkout rates. */
export function useShippingQuote(
  subtotal: number,
  postcode = "",
  method: FulfillmentMethod = "delivery"
) {
  const [quote, setQuote] = useState<ShippingQuote | null>(null);

  const applied =
    method === "delivery" && isValidUkPostcode(postcode) ? postcode : "";

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({
        subtotal: String(subtotal),
        method,
      });
      if (applied) params.set("postcode", applied);
      fetch(`/api/shipping/quote?${params}`, { signal: controller.signal })
        .then(async (res) => {
          const data = (await res.json()) as ShippingQuote & { error?: string };
          if (!res.ok) return;
          setQuote({
            shippingGbp: data.shippingGbp,
            bandLabel: data.bandLabel,
            totalGbp: data.totalGbp,
            postcodeApplied: data.postcodeApplied,
            method: data.method === "collection" ? "collection" : "delivery",
            collectionEnabled: Boolean(data.collectionEnabled),
            collectionLabel: data.collectionLabel ?? null,
          });
        })
        .catch(() => {
          /* keep last quote */
        });
    }, applied ? 280 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [subtotal, applied, method]);

  return quote;
}
