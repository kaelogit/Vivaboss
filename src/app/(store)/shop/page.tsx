import Image from "next/image";
import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import ShopProductGrid from "@/components/shop/ShopProductGrid";
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

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initialQuery = q?.trim() ?? "";
  const [categories, products] = await Promise.all([
    getVisibleCategories(),
    listActiveProducts(),
  ]);

  return (
    <main>
      <SectionIntro
        eyebrow="Shop"
        title="Buy from Vivaboss"
        description="Four collections — handmade fashion, personalised gifts, smart-home products, and home essentials — available online across the UK."
        image={marketingImages.shop.fashionCampaign}
        imageAlt="Handmade Vivaboss fashion campaign"
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

      <section id="shop-results" className="bg-vb-paper py-16 sm:py-20">
        <div className="vb-container">
          <div>
            <p className="vb-eyebrow">Catalogue</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              All products
            </h2>
          </div>

          {products.length > 0 ? (
            <div className="mt-10">
              <ShopProductGrid products={products} initialQuery={initialQuery} />
            </div>
          ) : (
            <p className="mt-10 max-w-xl text-sm leading-relaxed text-vb-muted">
              The catalogue is being stocked. Browse categories above, or{" "}
              <Link href="/contact" className="text-vb-accent hover:underline">
                contact us
              </Link>{" "}
              if you’re looking for something specific.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
