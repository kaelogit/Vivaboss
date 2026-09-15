"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";

export default function CartBadge() {
  const count = useCartStore((s) =>
    s.lines.reduce((n, l) => n + l.quantity, 0)
  );
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready || count < 1) return null;

  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-vb-accent px-1 font-heading text-[10px] font-bold text-white">
      {count}
    </span>
  );
}

export function CartLink() {
  const openCart = useCartStore((s) => s.openCart);

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative inline-flex h-10 w-10 items-center justify-center text-vb-accent transition-colors hover:text-vb-accent-hover"
      aria-label="Open bag"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <CartBadge />
    </button>
  );
}
