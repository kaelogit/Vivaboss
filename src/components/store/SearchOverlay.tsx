"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { shopCategories } from "@/lib/navigation";
import { shopTileImages } from "@/lib/content/marketingImages";
import { formatGbp } from "@/lib/products/money";
import { cn } from "@/lib/utils";

const TRENDING = [
  { label: "Personalised gifts", href: "/shop/personalised" },
  { label: "Fashion & accessories", href: "/shop/fashion" },
  { label: "Smart home", href: "/shop/smart-home" },
  { label: "Home & DIY", href: "/shop/home-diy" },
  { label: "Engraving", href: "/shop?q=engraving#shop-results" },
  { label: "Track an order", href: "/order/track" },
] as const;

type SuggestProduct = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price_gbp: number;
  category: string | null;
};

export default function SearchOverlay() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [suggested, setSuggested] = useState<SuggestProduct[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/shop/suggest")
      .then((res) => res.json())
      .then((data: { products?: SuggestProduct[] }) => {
        if (!cancelled) setSuggested(data.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setSuggested([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);

    const focusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  const goSearch = () => {
    const needle = q.trim();
    setOpen(false);
    setQ("");
    router.push(
      needle
        ? `/shop?q=${encodeURIComponent(needle)}#shop-results`
        : "/shop#shop-results"
    );
  };

  const trending = q.trim()
    ? TRENDING.filter((item) =>
        item.label.toLowerCase().includes(q.trim().toLowerCase())
      )
    : TRENDING;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center text-vb-ink transition-colors hover:text-vb-accent"
        aria-label="Search"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <Search size={20} strokeWidth={1.75} />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[120] transition-opacity duration-300",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="absolute inset-0 bg-vb-ink/35"
          aria-label="Close search"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />

        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          inert={!open}
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-vb-white shadow-[-24px_0_60px_-28px_rgba(18,17,16,0.4)] transition-transform duration-300 ease-out sm:max-w-lg",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-vb-line px-5 sm:h-16 sm:px-6">
            <p
              id={titleId}
              className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-ink"
            >
              Search
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-ink"
              aria-label="Close"
            >
              Close
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                goSearch();
              }}
            >
              <label className="sr-only" htmlFor="vb-search-overlay">
                Search by keyword
              </label>
              <div className="flex h-12 items-stretch border border-vb-ink bg-vb-white">
                <input
                  ref={inputRef}
                  id="vb-search-overlay"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by keyword, collection…"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-vb-ink outline-none placeholder:text-vb-muted"
                />
                <button
                  type="submit"
                  className="shrink-0 px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-ink hover:text-vb-accent"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-10">
              <p className="font-heading text-sm font-bold tracking-tight text-vb-ink">
                Trending searches
              </p>
              {trending.length === 0 ? (
                <p className="mt-4 text-sm text-vb-muted">No matching trends.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {trending.map((item) => (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="text-sm text-vb-muted transition-colors hover:text-vb-accent"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-10">
              <p className="font-heading text-sm font-bold tracking-tight text-vb-ink">
                Suggested for you
              </p>
              {suggested.length > 0 ? (
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  {suggested.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => setOpen(false)}
                        className="group block"
                      >
                        <span className="relative block aspect-[4/5] overflow-hidden bg-vb-mist">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt=""
                              fill
                              sizes="200px"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          ) : null}
                        </span>
                        <span className="mt-2 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-ink group-hover:text-vb-accent">
                          {product.name}
                        </span>
                        {product.price_gbp > 0 && (
                          <span className="mt-1 block text-xs text-vb-muted">
                            {formatGbp(product.price_gbp)}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  {shopCategories.map((cat) => {
                    const image = shopTileImages[cat.slug];
                    return (
                      <li key={cat.slug}>
                        <Link
                          href={cat.href}
                          onClick={() => setOpen(false)}
                          className="group block"
                        >
                          <span className="relative block aspect-[4/5] overflow-hidden bg-vb-mist">
                            {image && (
                              <Image
                                src={image}
                                alt=""
                                fill
                                sizes="200px"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            )}
                          </span>
                          <span className="mt-2 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-ink group-hover:text-vb-accent">
                            {cat.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
