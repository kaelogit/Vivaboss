"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import CartLineItem from "@/components/shop/CartLineItem";
import { formatGbp } from "@/lib/products/money";
import { lineTotal } from "@/lib/cart/types";
import { PREORDER_LEAD } from "@/lib/products/stock";
import { useCartStore } from "@/store/cart";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const hasPreorder = lines.some((l) => l.isPreorder);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] bg-vb-ink/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-[90] flex w-[min(100%,26rem)] flex-col border-l border-vb-line bg-vb-white shadow-[-24px_0_60px_-28px_rgba(18,17,16,0.45)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
        aria-label="Your bag"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-vb-line px-5 py-5 sm:px-6">
          <div className="flex items-baseline gap-3">
            <p className="font-heading text-lg font-extrabold uppercase tracking-[0.14em] text-vb-ink sm:text-xl">
              Your bag
            </p>
            {count > 0 && (
              <span className="bg-vb-mist px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-vb-muted">
                {count}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 text-vb-ink transition-colors hover:text-vb-accent"
            aria-label="Close bag"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {lines.length === 0 ? (
            <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-center">
              <ShoppingBag
                size={40}
                strokeWidth={1}
                className="text-vb-muted"
              />
              <p className="mt-5 font-heading text-sm font-bold uppercase tracking-[0.18em] text-vb-ink">
                Your bag is empty
              </p>
              <p className="mt-2 max-w-[16rem] text-sm text-vb-muted">
                Fashion, personalised gifts, and smart-home pieces land here.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-8 inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-ink transition-colors hover:bg-vb-ink hover:text-vb-paper"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {hasPreorder && (
                <p className="mb-5 border border-vb-line bg-vb-mist/60 px-3 py-2.5 text-xs leading-relaxed text-vb-muted">
                  Includes pre-order items — typically {PREORDER_LEAD} after
                  payment.
                </p>
              )}
              {lines.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  compact
                  onNavigate={closeCart}
                />
              ))}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="shrink-0 space-y-3 border-t border-vb-line bg-vb-paper px-5 py-5 sm:px-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-ink">
                Subtotal
              </span>
              <span className="font-heading text-xl font-bold text-vb-ink">
                {formatGbp(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-vb-muted">
              UK shipping calculated at checkout from your postcode.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex h-12 w-full items-center justify-center bg-vb-ink font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper transition-colors hover:bg-vb-accent"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="flex h-11 w-full items-center justify-center border border-vb-ink font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-ink transition-colors hover:bg-vb-white"
            >
              View full bag ({count})
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
