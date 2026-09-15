"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

/** Clears local cart after a successful Stripe return. */
export default function ClearCartOnSuccess() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
