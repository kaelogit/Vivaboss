"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { formatGbp } from "@/lib/products/money";
import { lineTotal, lineUnitTotal, type CartLine } from "@/lib/cart/types";
import { PREORDER_LEAD } from "@/lib/products/stock";
import { useCartStore } from "@/store/cart";

type Props = {
  line: CartLine;
  compact?: boolean;
  onNavigate?: () => void;
};

export default function CartLineItem({
  line,
  compact = false,
  onNavigate,
}: Props) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const href = `/product/${line.slug}`;
  const unit = lineUnitTotal(line);
  const total = lineTotal(line);
  const unitCompare =
    line.compareAtGbp != null && line.compareAtGbp > line.unitPriceGbp
      ? line.compareAtGbp +
        line.customisation.reduce((sum, c) => sum + (c.price_delta_gbp ?? 0), 0) +
        (line.installationRequested && line.installationPriceGbp != null
          ? line.installationPriceGbp
          : 0)
      : null;
  const lineCompare = unitCompare != null ? unitCompare * line.quantity : null;
  const onSale = lineCompare != null;

  return (
    <article
      className={`flex gap-4 border-b border-vb-line ${
        compact ? "pb-5" : "pb-8 lg:pb-10"
      }`}
    >
      <Link
        href={href}
        onClick={onNavigate}
        className={`relative shrink-0 overflow-hidden bg-vb-mist ${
          compact ? "h-24 w-20" : "h-32 w-24 sm:h-40 sm:w-28"
        }`}
      >
        {line.image ? (
          <Image
            src={line.image}
            alt={line.name}
            fill
            sizes={compact ? "80px" : "112px"}
            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={onNavigate}
              className={`font-heading font-bold uppercase tracking-wider text-vb-ink transition-colors hover:text-vb-accent line-clamp-2 ${
                compact ? "text-xs" : "text-sm sm:text-base"
              }`}
            >
              {line.name}
            </Link>
            {line.isPreorder && (
              <p className="mt-1.5 inline-block bg-vb-accent/10 px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-[0.14em] text-vb-accent">
                Pre-order · {PREORDER_LEAD}
              </p>
            )}
            {line.customisation.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-[11px] leading-snug text-vb-muted">
                {line.customisation.map((c) => (
                  <li key={c.key}>
                    {c.label}: {c.value}
                  </li>
                ))}
              </ul>
            )}
            {line.installationRequested && (
              <p className="mt-1.5 text-[11px] text-vb-accent">
                Installation
                {line.installationPriceGbp != null
                  ? ` · ${formatGbp(line.installationPriceGbp)}`
                  : " · quote"}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(line.id)}
            className="shrink-0 p-1 text-vb-muted transition-colors hover:text-vb-danger"
            aria-label={`Remove ${line.name}`}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center border border-vb-line">
            <button
              type="button"
              onClick={() => setQuantity(line.id, line.quantity - 1)}
              className="p-2 transition-colors hover:bg-vb-mist"
              aria-label="Decrease quantity"
            >
              <Minus size={14} strokeWidth={1.75} />
            </button>
            <span className="min-w-[2rem] px-2 text-center font-heading text-xs font-bold">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(line.id, line.quantity + 1)}
              className="p-2 transition-colors hover:bg-vb-mist"
              aria-label="Increase quantity"
            >
              <Plus size={14} strokeWidth={1.75} />
            </button>
          </div>
          <div className="text-right">
            {onSale && lineCompare != null && (
              <p className="text-[10px] text-vb-muted line-through decoration-1">
                {formatGbp(lineCompare)}
              </p>
            )}
            <p
              className={`font-heading text-sm font-bold ${
                onSale ? "text-vb-accent" : "text-vb-ink"
              }`}
            >
              {formatGbp(total)}
            </p>
            {line.quantity > 1 && (
              <p className="mt-0.5 text-[10px] text-vb-muted">
                {onSale && unitCompare != null && (
                  <span className="mr-1.5 line-through">
                    {formatGbp(unitCompare)}
                  </span>
                )}
                {formatGbp(unit)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
