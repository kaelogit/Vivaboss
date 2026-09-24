"use client";

import { useEffect, useState } from "react";
import { isValidUkPostcode } from "@/lib/uk/postcode";

export type ShippingQuote = {
  shippingGbp: number;
  bandLabel: string | null;
  totalGbp: number;
  postcodeApplied: boolean;
};

/** Live shipping quote matching server checkout rates. */
export function useShippingQuote(subtotal: number, postcode = "") {
  const [quote, setQuote] = useState<ShippingQuote | null>(null);

  const applied = isValidUkPostcode(postcode) ? postcode : "";

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ subtotal: String(subtotal) });
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
  }, [subtotal, applied]);

  return quote;
}
