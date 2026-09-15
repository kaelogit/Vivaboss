import Image from "next/image";
import Link from "next/link";
import SectionIntro, { ComingOnlineNote } from "@/components/store/SectionIntro";
import ProductCard from "@/components/shop/ProductCard";
import {
  marketingImages,
  shopTileImages,
} from "@/lib/content/marketingImages";
import { getVisibleCategories } from "@/lib/catalog/categories";
import { listActiveProducts } from "@/lib/products/queries";

export const metadata = {
  title: "Shop",
  description:
    "Fashion, personalised gifts, smart home products and home equipment from Vivaboss Fusion.",
};

export default async function ShopPage() {
  const [categories, products] = await Promise.all([
    getVisibleCategories(),
    listActiveProducts({ limit: 24 }),
  ]);

  return (
    <main>
      <SectionIntro
        eyebrow="Shop"
        title="Buy from Vivaboss"
        description="Four collections — handmade fashion, personalised gifts, smart-home products, and home essentials — available online across the UK."
        image={marketingImages.hero.alternate}
        imageAlt="Handmade fashion and craft from Vivaboss"
      />

      <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
        <div className="vb-container">
          <p className="vb-eyebrow">Collections</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Shop by collection
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categories.map((cat) => {
              const image = shopTileImages[cat.slug];
              return (
                <li key={cat.slug}>
                  <Link
                    href={cat.href}
                    className="group relative block min-h-[18rem] overflow-hidden bg-vb-mist sm:min-h-[20rem]"
                  >
                    {image && (
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-vb-ink/85 via-vb-ink/25 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-vb-paper">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-vb-paper/70">
                          {cat.description}
                        </p>
                      )}
                      <span className="mt-4 inline-flex font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-accent">
                        Explore →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="bg-vb-paper py-16 sm:py-20">
        <div className="vb-container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="vb-eyebrow">Catalogue</p>
              <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                All products
              </h2>
            </div>
            <p className="text-sm text-vb-muted">
              {products.length
                ? `${products.length} live`
                : "Connect Supabase to load catalogue"}
            </p>
          </div>

          {products.length > 0 ? (
            <ul className="mt-12 grid grid-cols-2 gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, i) => (
                <li key={product.id}>
                  <ProductCard product={product} priority={i < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10">
              <ComingOnlineNote note="Run the products migration to seed demo items, or add products in admin. Until Supabase is connected, category pages stay ready with placeholders." />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
