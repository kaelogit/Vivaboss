import Image from "next/image";
import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import ShopProductGrid from "@/components/shop/ShopProductGrid";
import { getVisibleCategories } from "@/lib/catalog/categories";
import {
  shopCategoryImages,
  shopTileImages,
} from "@/lib/content/marketingImages";
import { listActiveProducts } from "@/lib/products/queries";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const categories = await getVisibleCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return { title: "Shop" };
  return {
    title: cat.name,
    description: cat.description ?? undefined,
  };
}

export default async function ShopCategoryPage({ params }: Props) {
  const { category } = await params;
  const categories = await getVisibleCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const products = await listActiveProducts({ categorySlug: category });
  const image = shopCategoryImages[category];
  const others = categories.filter((c) => c.slug !== category);

  return (
    <main>
      <SectionIntro
        eyebrow="Shop"
        title={cat.name}
        description={cat.description ?? undefined}
        image={image}
        imageAlt={cat.name}
      />
      <div className="vb-container py-12 sm:py-16">
        {products.length > 0 ? (
          <ShopProductGrid products={products} />
        ) : (
          <div className="border border-dashed border-vb-line bg-vb-white px-6 py-16 text-center">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-vb-ink">
              Nothing listed here yet
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-vb-muted">
              Products for this collection will appear once they&apos;re added in
              admin (and Supabase is connected). Browse other collections in the
              meantime.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
            >
              Back to shop
            </Link>
          </div>
        )}
      </div>

      {others.length > 0 && (
        <section className="border-t border-vb-line bg-vb-white py-16 sm:py-20">
          <div className="vb-container">
            <p className="vb-eyebrow">Keep browsing</p>
            <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              Other collections
            </h2>
            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {others.map((c) => {
                const shot = shopTileImages[c.slug] ?? shopCategoryImages[c.slug];
                return (
                  <li key={c.slug}>
                    <Link
                      href={c.href}
                      className="group relative block min-h-[14rem] overflow-hidden bg-vb-mist"
                    >
                      {shot && (
                        <Image
                          src={shot}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      )}
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-vb-ink/80 via-vb-ink/20 to-transparent"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <span className="font-heading text-sm font-bold uppercase tracking-tight text-vb-paper">
                          {c.name}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
