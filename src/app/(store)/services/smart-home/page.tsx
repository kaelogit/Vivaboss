import Image from "next/image";
import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import {
  ClosingCta,
  HowItWorks,
} from "@/components/store/MarketingBlocks";
import {
  serviceHowItWorks,
  smartHomeServiceItems,
} from "@/lib/content/marketing";
import {
  marketingImages,
  smartHomeGallery,
} from "@/lib/content/marketingImages";
import { whatsappHref } from "@/lib/navigation";
import { isWhatsAppLive } from "@/lib/site";

export const metadata = {
  title: "Smart Home Services",
  description:
    "Smart locks, cameras, doorbells, lighting and Wi‑Fi setup across the UK. Shop hardware and book Vivaboss installation.",
};

export default function SmartHomeServicesPage() {
  const waLive = isWhatsAppLive();

  return (
    <main>
      <SectionIntro
        eyebrow="Smart home"
        title="Setup & installation"
        description="Make your home smarter, safer, and more comfortable — we supply products and handle installation so everyday life gets easier."
        image={marketingImages.services.smartLock}
        imageAlt="Smart door lock fitted in a UK home"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/services/book?type=smart_home_install"
            className="inline-flex h-11 items-center bg-vb-accent px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover"
          >
            Book installation
          </Link>
          <Link
            href="/shop/smart-home"
            className="inline-flex h-11 items-center border border-vb-paper/35 px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:border-vb-paper hover:bg-vb-paper/5"
          >
            Shop smart home
          </Link>
          {waLive && (
            <a
              href={whatsappHref(
                "Hi Vivaboss — I'd like smart home installation help."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center border border-vb-paper/25 px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper/70 hover:border-vb-paper hover:text-vb-paper"
            >
              WhatsApp
            </a>
          )}
        </div>
      </SectionIntro>

      <section className="border-b border-vb-line bg-vb-ink">
        <div className="grid gap-px bg-vb-line/20 sm:grid-cols-3">
          {smartHomeGallery.map((shot) => (
            <div
              key={shot.src}
              className="relative aspect-[4/3] overflow-hidden bg-vb-ink"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
        <div className="vb-container">
          <p className="vb-eyebrow">What we set up</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight">
            Modern kits. Proper setup.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-vb-muted">
            From security to lighting and cleaner Wi‑Fi — we help bring useful
            smart products into your home and get them working the way you want.
          </p>
          <ul className="mt-10 columns-1 gap-x-12 sm:columns-2">
            {smartHomeServiceItems.map((item) => (
              <li
                key={item}
                className="mb-3 break-inside-avoid border-b border-vb-line pb-3 text-sm text-vb-ink sm:text-[15px]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HowItWorks
        title="How installation works"
        steps={[...serviceHowItWorks]}
      />

      <section className="border-b border-vb-line bg-vb-white">
        <div className="grid lg:grid-cols-2 lg:min-h-[520px]">
          <div className="order-2 flex items-center px-6 py-14 sm:px-10 lg:order-1 lg:px-16">
            <div className="max-w-md">
              <p className="vb-eyebrow">Buy × install</p>
              <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight">
                Hardware in the shop. Hands on site.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-vb-muted sm:text-[15px]">
                Prefer one brand for both the product and the visit? Browse
                Smart Home in the shop, then book Vivaboss installation — or add
                install on the product when it’s offered at checkout.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop/smart-home"
                  className="inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
                >
                  Browse products
                </Link>
                <Link
                  href="/services/book?type=smart_home_install"
                  className="inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-vb-ink hover:text-vb-paper"
                >
                  Book install only
                </Link>
              </div>
            </div>
          </div>
          <div className="relative order-1 min-h-[280px] overflow-hidden bg-vb-mist lg:order-2 lg:min-h-full">
            <Image
              src={marketingImages.shop.smartHome}
              alt="Smart home product collection"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-paper py-16 sm:py-20">
        <div className="vb-container grid gap-10 lg:grid-cols-3">
          {[
            {
              title: "Locks & access",
              body: "Smart locks and doorbells fitted carefully on UK doors — with finish notes, not forced entry theatrics.",
            },
            {
              title: "Cameras & sensors",
              body: "Placement that actually covers the angles you care about, with tidy cable management where needed.",
            },
            {
              title: "Lighting & Wi‑Fi",
              body: "Mood lighting, bulbs, plugs, and cleaner Wi‑Fi setup so the kit works the way you expected.",
            },
          ].map((item) => (
            <div key={item.title} className="border-t border-vb-line pt-6">
              <h3 className="font-heading text-sm font-bold uppercase tracking-[0.14em]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-vb-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ClosingCta
        title="Book smart-home setup"
        body="Tell us what you’re installing and where — we’ll confirm the visit."
        primary={{
          href: "/services/book?type=smart_home_install",
          label: "Book installation",
        }}
        secondary={{ href: "/shop/smart-home", label: "Shop hardware" }}
      />
    </main>
  );
}
