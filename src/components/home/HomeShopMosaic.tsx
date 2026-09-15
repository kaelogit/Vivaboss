import Image from "next/image";
import Link from "next/link";
import { shopTileImages } from "@/lib/content/marketingImages";
import { shopCategories } from "@/lib/navigation";

/**
 * Desktop: immersive mosaic.
 * Mobile: 2-up top row, then two full-width bands — text stays on the image.
 */
export default function HomeShopMosaic() {
  const [fashion, personalised, smart, diy] = shopCategories;

  return (
    <section className="border-b border-vb-line bg-vb-white py-20 sm:py-24">
      <div className="vb-container">
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          data-vb-reveal="up"
        >
          <div>
            <p className="vb-eyebrow">Browse the shop</p>
            <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              Shop by collection
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-vb-muted">
              Four collections under one standard — fashion with presence,
              gifts with memory, smart kits for UK homes, and the tools to
              improve them.
            </p>
          </div>
          <Link
            href="/shop"
            className="shrink-0 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
          >
            View all products →
          </Link>
        </div>

        {/* Mobile / tablet — 2 on top, then one full-width each */}
        <div className="mt-10 grid grid-cols-2 gap-3 lg:hidden">
          {[fashion, personalised].map((cat, i) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group relative min-h-[15rem] overflow-hidden bg-vb-mist sm:min-h-[18rem]"
              data-vb-reveal="scale"
              data-vb-reveal-delay={i * 70}
            >
              <Image
                src={shopTileImages[cat.slug]}
                alt=""
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                priority={cat.slug === "fashion"}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-vb-ink/85 via-vb-ink/30 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                {cat.slug === "fashion" && (
                  <p className="font-heading text-[9px] font-bold uppercase tracking-[0.18em] text-vb-accent">
                    Featured
                  </p>
                )}
                <h3
                  className={`font-heading text-sm font-bold uppercase tracking-tight text-vb-paper sm:text-base ${
                    cat.slug === "fashion" ? "mt-1" : ""
                  }`}
                >
                  {cat.label}
                </h3>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-vb-paper/70 sm:text-xs">
                  {cat.blurb}
                </p>
              </div>
            </Link>
          ))}

          {[smart, diy].map((cat, i) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group relative col-span-2 min-h-[13rem] overflow-hidden bg-vb-mist sm:min-h-[16rem]"
              data-vb-reveal="scale"
              data-vb-reveal-delay={(i + 2) * 70}
            >
              <Image
                src={shopTileImages[cat.slug]}
                alt=""
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-vb-ink/85 via-vb-ink/25 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-vb-paper sm:text-xl">
                  {cat.label}
                </h3>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-vb-paper/70 sm:text-sm">
                  {cat.blurb}
                </p>
                <span className="mt-3 inline-flex font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-paper">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop — immersive mosaic */}
        <div className="mt-12 hidden gap-3 lg:grid lg:grid-cols-4 lg:grid-rows-2">
          <Link
            href={fashion.href}
            className="group relative col-span-2 row-span-2 min-h-[36rem] overflow-hidden bg-vb-mist"
            data-vb-reveal="scale"
          >
            <Image
              src={shopTileImages.fashion}
              alt=""
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-vb-ink/85 via-vb-ink/25 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-vb-accent">
                Featured
              </p>
              <h3 className="mt-2 font-heading text-3xl font-bold uppercase tracking-tight text-vb-paper">
                {fashion.label}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-vb-paper/70">
                {fashion.blurb}
              </p>
              <span className="mt-5 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper">
                Explore →
              </span>
            </div>
          </Link>

          {[personalised, smart].map((cat, i) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group relative min-h-[18rem] overflow-hidden bg-vb-mist"
              data-vb-reveal="scale"
              data-vb-reveal-delay={(i + 1) * 80}
            >
              <Image
                src={shopTileImages[cat.slug]}
                alt=""
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-vb-ink/80 via-vb-ink/20 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-vb-paper">
                  {cat.label}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-vb-paper/65">
                  {cat.blurb}
                </p>
              </div>
            </Link>
          ))}

          <Link
            href={diy.href}
            className="group relative col-span-2 min-h-[18rem] overflow-hidden bg-vb-mist"
            data-vb-reveal="scale"
            data-vb-reveal-delay={240}
          >
            <Image
              src={shopTileImages[diy.slug]}
              alt=""
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-vb-ink/80 via-vb-ink/20 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-vb-paper">
                {diy.label}
              </h3>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-vb-paper/65">
                {diy.blurb}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
