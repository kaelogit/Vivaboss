import Link from "next/link";
import ProductBuyBox from "@/components/shop/ProductBuyBox";
import ProductCard from "@/components/shop/ProductCard";
import ProductGallery from "@/components/shop/ProductGallery";
import { formatGbp, saleCompareAt, saleDiscountPercent, saleSaveGbp } from "@/lib/products/money";
import type {
  ProductDetail,
  ProductWithCategory,
} from "@/lib/products/queries";

const promises = [
  {
    title: "UK delivery",
    body: "Orders ship across the United Kingdom with clear tracking after payment.",
  },
  {
    title: "Secure checkout",
    body: "Pay in GBP at checkout with clear totals before you confirm.",
  },
  {
    title: "Craft standard",
    body: "The same care we put into fashion and gifts goes into every smart-home kit.",
  },
] as const;

export default function ProductDetailView({
  product,
  related,
}: {
  product: ProductDetail;
  related: ProductWithCategory[];
}) {
  const price = Number(product.price_gbp);
  const compare = saleCompareAt(price, product.compare_at_gbp);
  const discountPct = saleDiscountPercent(price, product.compare_at_gbp);
  const saveGbp = saleSaveGbp(price, product.compare_at_gbp);

  return (
    <main>
      <div className="border-b border-vb-line bg-vb-paper">
        <div className="vb-container py-10 sm:py-14 lg:py-16">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
            <Link href="/shop" className="hover:text-vb-accent">
              Shop
            </Link>
            {product.categories && (
              <>
                <span className="mx-2 text-vb-line">/</span>
                <Link
                  href={`/shop/${product.categories.slug}`}
                  className="hover:text-vb-accent"
                >
                  {product.categories.name}
                </Link>
              </>
            )}
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <ProductGallery
              images={product.images ?? []}
              name={product.name}
            />

            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-vb-accent">
                {product.categories?.name ?? "Vivaboss Shop"}
              </p>
              <h1 className="mt-3 font-heading text-3xl font-extrabold uppercase tracking-tight text-vb-ink sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-baseline gap-3">
                {product.requires_approval && price <= 0 ? (
                  <span className="font-heading text-xl font-bold text-vb-ink">
                    Request a quote
                  </span>
                ) : (
                  <>
                    <span
                      className={`font-heading text-2xl font-bold ${
                        compare != null ? "text-vb-accent" : "text-vb-ink"
                      }`}
                    >
                      {formatGbp(price)}
                    </span>
                    {compare != null && (
                      <span className="text-base text-vb-muted line-through">
                        {formatGbp(compare)}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="bg-vb-accent px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                        −{discountPct}% · Save {formatGbp(saveGbp)}
                      </span>
                    )}
                  </>
                )}
              </div>

              {product.short_description && (
                <p className="mt-5 text-base leading-relaxed text-vb-muted sm:text-lg">
                  {product.short_description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {product.is_customisable && !product.requires_approval && (
                  <span className="border border-vb-accent/30 bg-vb-accent-soft px-2.5 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-accent">
                    Choose options
                  </span>
                )}
                {product.requires_approval && (
                  <span className="border border-vb-line bg-vb-white px-2.5 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
                    Request a quote
                  </span>
                )}
                {product.offers_installation && (
                  <span className="border border-vb-line bg-vb-white px-2.5 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
                    Install available
                  </span>
                )}
              </div>

              <div id="buy-box" className="scroll-mt-28">
                <ProductBuyBox product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA — T40/Lee pattern for thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-vb-line bg-vb-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-muted">
              {product.name}
            </p>
            <p className="mt-0.5 font-heading text-sm font-bold text-vb-ink">
              {product.requires_approval && price <= 0 ? (
                "Request quote"
              ) : (
                <>
                  <span className={compare != null ? "text-vb-accent" : undefined}>
                    {formatGbp(price)}
                  </span>
                  {compare != null && (
                    <span className="ml-2 text-xs font-normal text-vb-muted line-through">
                      {formatGbp(compare)}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-vb-accent">
                      −{discountPct}%
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          <a
            href="#buy-box"
            className="inline-flex h-11 shrink-0 items-center bg-vb-ink px-4 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-paper"
          >
            {product.requires_approval
              ? "Request quote"
              : product.is_customisable
                ? "Choose options"
                : "Add to bag"}
          </a>
        </div>
      </div>
      <div className="h-16 lg:hidden" aria-hidden />

      <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
        <div className="vb-container grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p className="vb-eyebrow">Details</p>
            <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              What’s included in the story
            </h2>
            {product.description ? (
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-vb-muted">
                {product.description}
              </p>
            ) : (
              <p className="mt-6 text-base leading-relaxed text-vb-muted">
                Full product notes will sit here as catalogue copy is enriched
                in admin. Until then, use the buy box for options,
                customisation, and installation where offered.
              </p>
            )}
          </div>

            <div>
              <p className="vb-eyebrow">You might also need</p>
              <ul className="mt-6 space-y-0 border-y border-vb-line">
                {product.categories?.slug === "fashion" && (
                  <li className="border-b border-vb-line py-5">
                    <p className="font-heading text-sm font-semibold uppercase tracking-tight">
                      Personalise it
                    </p>
                    <p className="mt-2 text-sm text-vb-muted">
                      Add a tag or engraving so the piece is unmistakably
                      theirs.{" "}
                      <Link
                        href="/shop/personalised"
                        className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
                      >
                        Shop personalised →
                      </Link>
                    </p>
                  </li>
                )}
                {product.categories?.slug === "personalised" && (
                  <li className="border-b border-vb-line py-5">
                    <p className="font-heading text-sm font-semibold uppercase tracking-tight">
                      Careful delivery
                    </p>
                    <p className="mt-2 text-sm text-vb-muted">
                      Memorial and gift pieces deserve a careful courier handoff.{" "}
                      <Link
                        href="/courier/book"
                        className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
                      >
                        Book a delivery →
                      </Link>
                    </p>
                  </li>
                )}
                {(product.categories?.slug === "smart-home" ||
                  product.offers_installation) && (
                  <li className="border-b border-vb-line py-5">
                    <p className="font-heading text-sm font-semibold uppercase tracking-tight">
                      Professional install
                    </p>
                    <p className="mt-2 text-sm text-vb-muted">
                      Buy the kit here, then book Vivaboss to fit it — or add
                      install in the buy box when offered.{" "}
                      <Link
                        href="/services/book?type=smart_home_install"
                        className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
                      >
                        Book install →
                      </Link>
                    </p>
                  </li>
                )}
                {product.categories?.slug === "home-diy" && (
                  <li className="border-b border-vb-line py-5">
                    <p className="font-heading text-sm font-semibold uppercase tracking-tight">
                      Hands on site
                    </p>
                    <p className="mt-2 text-sm text-vb-muted">
                      Need labour as well as equipment?{" "}
                      <Link
                        href="/services/book?type=home_repair"
                        className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
                      >
                        Book a home visit →
                      </Link>
                    </p>
                  </li>
                )}
                <li className="py-5">
                  <p className="font-heading text-sm font-semibold uppercase tracking-tight">
                    Questions before you buy
                  </p>
                  <p className="mt-2 text-sm text-vb-muted">
                    Sizing, engraving, or install timing — we’re easy to reach.{" "}
                    <Link
                      href="/contact"
                      className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
                    >
                      Contact →
                    </Link>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

      <section className="border-b border-vb-line bg-vb-paper py-14 sm:py-16">
        <div className="vb-container">
          <ul className="grid gap-0 sm:grid-cols-3">
            {promises.map((item, i) => (
              <li
                key={item.title}
                className={`border-b border-vb-line py-8 sm:border-b-0 ${
                  i < promises.length - 1 ? "sm:border-r sm:pr-8" : ""
                } ${i > 0 ? "sm:pl-8" : ""}`}
              >
                <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-vb-accent">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-vb-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-vb-white py-16 sm:py-20">
          <div className="vb-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="vb-eyebrow">More from Vivaboss</p>
                <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                  You may also like
                </h2>
              </div>
              {product.categories && (
                <Link
                  href={`/shop/${product.categories.slug}`}
                  className="shrink-0 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
                >
                  View collection →
                </Link>
              )}
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
