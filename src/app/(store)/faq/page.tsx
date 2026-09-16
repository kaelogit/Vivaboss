import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import { marketingImages } from "@/lib/content/marketingImages";
import { getPublicFaqItems } from "@/lib/content/siteSettings";

export const metadata = {
  title: "FAQ",
  description:
    "Answers about Vivaboss shop orders, personalised gifts, home services, smart-home installs, and courier bookings.",
};

export default async function FaqPage() {
  const items = await getPublicFaqItems();
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <main>
      <SectionIntro
        eyebrow="Help"
        title="FAQ"
        description="Straight answers for shoppers, bookings, and deliveries. Still stuck? Contact us — we’ll point you to the right path."
        image={marketingImages.shop.fashionHero}
        imageAlt="Handmade Vivaboss fashion"
      >
        <Link
          href="/contact"
          className="mt-8 inline-flex h-11 items-center border border-vb-paper/35 px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:border-vb-paper hover:bg-vb-paper/5"
        >
          Contact Vivaboss
        </Link>
      </SectionIntro>

      <div className="vb-container max-w-3xl py-12 sm:py-16 lg:py-20">
        {categories.map((cat) => {
          const catItems = items.filter((f) => f.category === cat);
          if (!catItems.length) return null;
          return (
            <section key={cat} className="mb-14 last:mb-0">
              <h2 className="vb-eyebrow text-vb-accent">{cat}</h2>
              <ul className="mt-6 divide-y divide-vb-line border-y border-vb-line">
                {catItems.map((item) => (
                  <li key={`${item.category}-${item.q}`} className="py-6">
                    <h3 className="font-heading text-base font-semibold text-vb-ink sm:text-lg">
                      {item.q}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-vb-muted sm:text-[15px]">
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
