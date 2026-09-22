"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatGbp, saleCompareAt } from "@/lib/products/money";
import type { ProductWithCategory } from "@/lib/products/queries";
import { marketingImages } from "@/lib/content/marketingImages";
import { shopCategories } from "@/lib/navigation";

type MarqueeItem = {
  key: string;
  href: string;
  name: string;
  meta: string;
  image: string | null;
  price: number | null;
  compare: number | null;
};

function productsToItems(products: ProductWithCategory[]): MarqueeItem[] {
  return products
    .filter((p) => p.images?.[0] || p.name)
    .map((p) => {
      const price = Number(p.price_gbp);
      return {
        key: p.id,
        href: `/product/${p.slug}`,
        name: p.name,
        meta: p.categories?.name ?? "Shop",
        image: p.images?.[0] ?? null,
        price: price > 0 ? price : null,
        compare: saleCompareAt(price, p.compare_at_gbp),
      };
    });
}

const categoryFallback: MarqueeItem[] = shopCategories.map((c) => {
  const images: Record<string, string> = {
    fashion: marketingImages.shop.fashion,
    personalised: marketingImages.shop.personalised,
    "smart-home": marketingImages.shop.smartHome,
    "home-diy": marketingImages.services.furniture,
  };
  return {
    key: c.slug,
    href: c.href,
    name: c.label,
    meta: "Collection",
    image: images[c.slug] ?? marketingImages.shop.leatherBag,
    price: null,
    compare: null,
  };
});

type Props = {
  products: ProductWithCategory[];
};

export default function HomeProductMarquee({ products }: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const holdingRef = useRef(false);
  const [paused, setPaused] = useState(false);

  const items = productsToItems(products);
  const source = items.length >= 3 ? items : categoryFallback;
  const ribbon = [...source, ...source, ...source];

  const pause = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore right-click / non-primary
    if (e.button !== 0) return;
    holdingRef.current = true;
    setPaused(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const resume = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setPaused(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  return (
    <section
      className="overflow-hidden border-b border-vb-line bg-vb-ink"
      aria-label="Products from the shop"
    >
      <div className="vb-container flex flex-col gap-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:py-10">
        <div data-vb-reveal="up">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-vb-accent">
            In the shop
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight text-vb-paper sm:text-3xl">
            Pieces on the move
          </h2>
        </div>
        <Link
          href="/shop"
          className="shrink-0 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent transition-colors hover:text-vb-paper"
          data-vb-reveal="fade"
        >
          Shop all →
        </Link>
      </div>

      <div
        ref={surfaceRef}
        className="relative cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={pause}
        onPointerUp={resume}
        onPointerCancel={resume}
        role="presentation"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-vb-ink to-transparent sm:w-16"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-vb-ink to-transparent sm:w-16"
          aria-hidden
        />

        <div
          className={`vb-marquee flex w-max gap-3 py-2 pb-10 sm:gap-4 sm:pb-12 ${
            paused ? "vb-marquee-paused" : ""
          }`}
        >
          {ribbon.map((item, i) => (
            <Link
              key={`${item.key}-${i}`}
              href={item.href}
              className="group flex w-[11.5rem] shrink-0 flex-col sm:w-[14rem]"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-vb-mist">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 184px, 224px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 bg-vb-mist" aria-hidden />
                )}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-vb-ink/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
              </div>
              <div className="mt-3 px-0.5">
                <p className="font-heading text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  {item.meta}
                </p>
                <p className="mt-1 line-clamp-2 font-heading text-[11px] font-bold uppercase tracking-[0.08em] text-vb-paper transition-colors group-hover:text-vb-accent sm:text-xs">
                  {item.name}
                </p>
                {item.price != null && (
                  <p className="mt-1.5 flex items-baseline gap-2 text-sm text-vb-paper/90">
                    {item.compare != null && (
                      <span className="text-xs text-white/35 line-through">
                        {formatGbp(item.compare)}
                      </span>
                    )}
                    <span
                      className={
                        item.compare != null ? "text-vb-accent" : undefined
                      }
                    >
                      {formatGbp(item.price)}
                    </span>
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
