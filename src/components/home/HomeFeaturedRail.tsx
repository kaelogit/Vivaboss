import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import type { ProductWithCategory } from "@/lib/products/queries";

type Props = {
  products: ProductWithCategory[];
};

export default function HomeFeaturedRail({ products }: Props) {
  if (!products.length) {
    return (
      <section className="border-b border-vb-line bg-vb-paper py-20 sm:py-24">
        <div className="vb-container" data-vb-reveal="up">
          <p className="vb-eyebrow">From the shop</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Featured pieces
          </h2>
          <p className="mt-4 max-w-lg text-vb-muted">
            Catalogue pieces appear here once products are live in admin. Until
            then, browse the collections above — fashion, personalised, smart
            home, and home & DIY are ready.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
          >
            Enter the shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-vb-line bg-vb-paper py-20 sm:py-24">
      <div className="vb-container">
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          data-vb-reveal="up"
        >
          <div>
            <p className="vb-eyebrow">From the shop</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Featured pieces
            </h2>
            <p className="mt-3 max-w-lg text-vb-muted">
              A short edit of what’s live now — the same craft standard across
              every collection.
            </p>
          </div>
          <Link
            href="/shop"
            className="shrink-0 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
          >
            Shop all →
          </Link>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-4">
          {products.map((product, i) => (
            <li
              key={product.id}
              data-vb-reveal="up"
              data-vb-reveal-delay={i * 70}
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
