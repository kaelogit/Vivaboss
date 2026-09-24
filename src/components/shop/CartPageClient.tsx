"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import CartLineItem from "@/components/shop/CartLineItem";
import { formatGbp } from "@/lib/products/money";
import { lineTotal } from "@/lib/cart/types";
import { PREORDER_LEAD } from "@/lib/products/stock";
import { useCartStore } from "@/store/cart";
import { useShippingQuote } from "@/components/shop/useShippingQuote";

export default function CartPageClient() {
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const hasPreorder = lines.some((l) => l.isPreorder);
  const quote = useShippingQuote(subtotal);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <div className="vb-container py-16">
        <p className="text-sm text-vb-muted">Loading bag…</p>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="vb-container flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-vb-mist">
          <ShoppingBag size={28} strokeWidth={1.25} className="text-vb-muted" />
        </div>
        <p className="mt-8 vb-eyebrow">Your bag</p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold uppercase tracking-tight text-vb-ink sm:text-4xl">
          Bag is empty
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-vb-muted sm:text-base">
          Discover fashion, personalised gifts, and smart-home pieces — then
          come back here to review and checkout.
        </p>
        <Link
          href="/shop"
          className="mt-10 inline-flex h-12 items-center bg-vb-ink px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper transition-colors hover:bg-vb-accent"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="vb-container py-12 sm:py-16 lg:py-20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="vb-eyebrow">Your bag</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase tracking-tight text-vb-ink sm:text-4xl">
            Cart
          </h1>
          <p className="mt-2 text-sm text-vb-muted">
            {count} item{count === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/shop"
          className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted transition-colors hover:text-vb-accent"
        >
          ← Continue shopping
        </Link>
      </div>

      {hasPreorder && (
        <p className="mt-8 border border-vb-line bg-vb-mist/50 px-4 py-3 text-sm text-vb-muted">
          Your bag includes sold-out items on pre-order. These typically take{" "}
          {PREORDER_LEAD} after payment.
        </p>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <ul className="space-y-0 lg:col-span-7 xl:col-span-8">
          {lines.map((line) => (
            <li key={line.id}>
              <CartLineItem line={line} />
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="border border-vb-line bg-vb-paper p-6 sm:p-8 lg:sticky lg:top-24">
            <h2 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-vb-ink">
              Order summary
            </h2>
            <div className="mt-6 space-y-2 border-b border-vb-line pb-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-vb-muted">
                  Subtotal ({count} item{count === 1 ? "" : "s"})
                </span>
                <span className="font-heading text-base font-semibold">
                  {formatGbp(subtotal)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-vb-muted">
                  {quote?.shippingGbp === 0
                    ? "Shipping"
                    : "Shipping · UK standard"}
                </span>
                <span className="font-heading text-base font-semibold">
                  {quote == null
                    ? "…"
                    : quote.shippingGbp === 0
                      ? "Free"
                      : formatGbp(quote.shippingGbp)}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em]">
                Total
              </span>
              <span className="font-heading text-2xl font-bold">
                {quote == null ? "…" : formatGbp(quote.totalGbp)}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-vb-muted">
              Standard UK delivery. Highlands, Islands, and Northern Ireland
              are confirmed from your postcode at checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-6 flex h-12 w-full items-center justify-center bg-vb-accent font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-vb-accent-hover"
            >
              Proceed to checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 flex h-11 w-full items-center justify-center border border-vb-ink font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-ink transition-colors hover:bg-vb-white"
            >
              Continue shopping
            </Link>
            <button
              type="button"
              onClick={() => clear()}
              className="mt-5 w-full text-center text-xs uppercase tracking-wider text-vb-muted transition-colors hover:text-vb-danger"
            >
              Clear bag
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function CartPageShell() {
  return (
    <main>
      <CartPageClient />
    </main>
  );
}
