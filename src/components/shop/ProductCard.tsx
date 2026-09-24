"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { formatGbp, saleCompareAt, saleDiscountPercent } from "@/lib/products/money";
import {
  canPreorder,
  isUnavailable,
} from "@/lib/products/stock";
import { useCartStore } from "@/store/cart";
import ProductPhotoFallback from "@/components/shop/ProductPhotoFallback";
import type { ProductWithCategory } from "@/lib/products/queries";

export default function ProductCard({
  product,
  priority = false,
}: {
  product: ProductWithCategory;
  priority?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [imgReady, setImgReady] = useState(false);

  const mainImage = product.images?.[0];
  const hoverImage = product.images?.[1] ?? null;
  const price = Number(product.price_gbp);
  const compare = saleCompareAt(price, product.compare_at_gbp);
  const discount = saleDiscountPercent(price, product.compare_at_gbp);
  const preorder = canPreorder(product);
  const unavailable = isUnavailable(product);
  const needsPdp = product.requires_approval || product.is_customisable;
  const canQuickAdd = !needsPdp && !unavailable && price > 0;

  const href = `/product/${product.slug}`;
  const meta = product.categories?.name ?? "Shop";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canQuickAdd) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: mainImage,
      unitPriceGbp: price,
      compareAtGbp: compare,
      quantity: 1,
      isPreorder: preorder,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden bg-vb-mist sm:aspect-[4/5]">
        <Link href={href} className="absolute inset-0 block" aria-label={product.name}>
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                  hoverImage ? "group-hover:opacity-0" : ""
                }`}
                onLoad={() => setImgReady(true)}
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="absolute inset-0 object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
                />
              )}
              {!imgReady && (
                <div className="absolute inset-0 animate-pulse bg-vb-line/40" />
              )}
            </>
          ) : (
            <ProductPhotoFallback name={product.name} compact />
          )}
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col items-start gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          {product.requires_approval && (
            <span className="bg-vb-ink px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase tracking-[0.14em] text-vb-paper sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.16em]">
              Quote
            </span>
          )}
          {product.is_customisable && !product.requires_approval && (
            <span className="bg-vb-accent px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase tracking-[0.14em] text-white sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.16em]">
              Options
            </span>
          )}
          {product.offers_installation && (
            <span className="border border-vb-ink/20 bg-vb-white/95 px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase tracking-[0.14em] text-vb-ink sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.16em]">
              Install
            </span>
          )}
          {discount > 0 && (
            <span className="bg-vb-accent px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase tracking-[0.14em] text-white sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.16em]">
              −{discount}%
            </span>
          )}
        </div>

        {canQuickAdd && (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={added ? "Added to cart" : "Add to cart"}
            className={`absolute bottom-2 right-2 z-20 flex h-9 w-9 items-center justify-center shadow-md transition-all duration-300 sm:bottom-3 sm:right-3 sm:h-11 sm:w-11 ${
              added
                ? "scale-110 bg-vb-accent text-white"
                : "bg-vb-white text-vb-ink hover:bg-vb-ink hover:text-vb-paper"
            }`}
          >
            {added ? (
              <Check className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} />
            )}
          </button>
        )}

        {needsPdp && !unavailable && (
          <Link
            href={href}
            className="absolute bottom-2 right-2 z-20 flex h-8 items-center bg-vb-white px-2 font-heading text-[8px] font-bold uppercase tracking-[0.14em] text-vb-ink shadow-md transition-colors hover:bg-vb-ink hover:text-vb-paper sm:bottom-3 sm:right-3 sm:h-11 sm:px-3 sm:text-[9px] sm:tracking-[0.16em]"
          >
            {product.requires_approval
              ? "Request quote"
              : preorder
                ? "Pre-order"
                : "Choose options"}
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-0.5 pt-2 sm:gap-1 sm:pt-3.5">
        <span className="font-heading text-[9px] font-bold uppercase tracking-[0.16em] text-vb-muted sm:text-[10px] sm:tracking-[0.18em]">
          {meta}
        </span>
        <Link href={href} className="block">
          <h3 className="line-clamp-2 font-heading text-[11px] font-bold uppercase tracking-[0.05em] text-vb-ink transition-colors hover:text-vb-accent sm:truncate sm:text-sm sm:tracking-[0.06em]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5 sm:mt-1 sm:gap-2">
          {product.requires_approval && price <= 0 ? (
            <span className="font-heading text-xs font-bold text-vb-ink sm:text-sm">
              Request quote
            </span>
          ) : (
            <>
              {compare != null && (
                <span className="text-[10px] text-vb-muted line-through sm:text-xs">
                  {formatGbp(compare)}
                </span>
              )}
              <span
                className={`font-heading text-xs font-bold sm:text-sm ${
                  discount > 0 ? "text-vb-accent" : "text-vb-ink"
                }`}
              >
                {formatGbp(price)}
              </span>
            </>
          )}
        </div>
        {preorder && (
          <span className="mt-0.5 font-heading text-[9px] font-bold uppercase tracking-[0.16em] text-vb-accent sm:mt-1 sm:text-[10px] sm:tracking-[0.18em]">
            Sold out · Pre-order
          </span>
        )}
        {unavailable && (
          <span className="mt-0.5 font-heading text-[9px] font-bold uppercase tracking-[0.16em] text-vb-muted sm:mt-1 sm:text-[10px] sm:tracking-[0.18em]">
            Out of stock
          </span>
        )}
      </div>
    </article>
  );
}
