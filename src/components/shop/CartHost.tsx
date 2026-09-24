"use client";

import { useEffect } from "react";
import CartDrawer from "@/components/shop/CartDrawer";
import { useCartStore } from "@/store/cart";

function BagNotice() {
  const notice = useCartStore((s) => s.notice);
  const clearNotice = useCartStore((s) => s.clearNotice);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(clearNotice, 2800);
    return () => window.clearTimeout(timer);
  }, [notice, clearNotice]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-[120] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      {notice ? (
        <p className="bg-vb-ink px-4 py-3 text-center font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-paper shadow-lg">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

/** Client host for the cart drawer inside the store layout. */
export default function CartHost() {
  return (
    <>
      <CartDrawer />
      <BagNotice />
    </>
  );
}
