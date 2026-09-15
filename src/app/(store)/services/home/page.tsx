import Image from "next/image";
import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import {
  ClosingCta,
  HowItWorks,
} from "@/components/store/MarketingBlocks";
import {
  homeServiceItems,
  serviceHowItWorks,
} from "@/lib/content/marketing";
import {
  homeServiceGallery,
  marketingImages,
} from "@/lib/content/marketingImages";
import { whatsappHref } from "@/lib/navigation";
import { isWhatsAppLive } from "@/lib/site";

export const metadata = {
  title: "Home Services",
  description:
    "Furniture and TV installation, painting, plumbing fixes, electrical fittings and more — Vivaboss home repairs UK-wide.",
};

export default function HomeServicesPage() {
  const waLive = isWhatsAppLive();

  return (
    <main>
      <SectionIntro
        eyebrow="Home services"
        title="Repairs & improvement"
        description="From small repairs to bigger improvements — we help keep your home looking great and working properly. Book with your postcode and preferred window."
        image={marketingImages.services.lighting}
        imageAlt="Home lighting and fittings installation"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/services/book?type=home_repair"
            className="inline-flex h-11 items-center bg-vb-accent px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover"
          >
            Book this service
          </Link>
          {waLive ? (
            <a
              href={whatsappHref(
                "Hi Vivaboss — I need a home repair / installation."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center border border-vb-paper/35 px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:border-vb-paper hover:bg-vb-paper/5"
            >
              WhatsApp
            </a>
          ) : (
            <Link
              href="/contact"
              className="inline-flex h-11 items-center border border-vb-paper/35 px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:border-vb-paper hover:bg-vb-paper/5"
            >
              Contact
            </Link>
          )}
        </div>
      </SectionIntro>

      <section className="border-b border-vb-line bg-vb-ink">
        <div className="grid gap-px bg-vb-line/20 sm:grid-cols-3 lg:grid-cols-5">
          {homeServiceGallery.map((shot) => (
            <div
              key={shot.src}
              className="relative aspect-[4/3] overflow-hidden bg-vb-ink"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
        <div className="vb-container">
          <p className="vb-eyebrow">What we handle</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight">
            Everyday fixes. Proper finishes.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-vb-muted">
            Need something fixed, installed, or improved around the house?
            We’re here to help — tell us the job on the booking form and attach
            photos if they help.
          </p>
          <ul className="mt-10 columns-1 gap-x-12 sm:columns-2">
            {homeServiceItems.map((item) => (
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
        title="How a home visit works"
        steps={[...serviceHowItWorks]}
      />

      <section className="border-b border-vb-line bg-vb-white">
        <div className="grid lg:grid-cols-2 lg:min-h-[520px]">
          <div className="relative min-h-[280px] overflow-hidden bg-vb-mist lg:min-h-full">
            <Image
              src={marketingImages.services.tv}
              alt="TV and furniture installation"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex items-center px-6 py-14 sm:px-10 lg:px-16">
            <div className="max-w-md">
              <p className="vb-eyebrow">The Vivaboss way</p>
              <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight">
                Prepared. Careful. Confirmed.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-vb-muted sm:text-[15px]">
                We treat home visits with the same craft standard as our shop —
                clear communication, tidy work, and a finish you’d be happy to
                show. If the job needs parts from Home & DIY, we can guide you
                there before we arrive.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-vb-ink">
                <li className="border-b border-vb-line pb-3">
                  Email confirmation after review
                </li>
                <li className="border-b border-vb-line pb-3">
                  Photos welcome on the booking form
                </li>
                <li>UK-wide coverage with postcode-aware planning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-paper py-16 sm:py-20">
        <div className="vb-container grid gap-10 lg:grid-cols-2">
          <div>
            <p className="vb-eyebrow">Coverage</p>
            <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight">
              UK-wide attendance
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-vb-muted">
              We accept bookings across the United Kingdom. Share your postcode
              and preferred window so we can confirm travel and timing before we
              attend.
            </p>
          </div>
          <div>
            <p className="vb-eyebrow">Need equipment?</p>
            <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight">
              Shop Home & DIY
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-vb-muted">
              Looking for tools or home improvement products as well as labour?
              Browse Home & DIY in the shop, then book a visit when you need
              hands on site.
            </p>
            <Link
              href="/shop/home-diy"
              className="mt-6 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
            >
              Browse Home & DIY →
            </Link>
          </div>
        </div>
      </section>

      <ClosingCta
        title="Book a home visit"
        body="Postcode, photos, and preferred window — we confirm next steps by email."
        primary={{
          href: "/services/book?type=home_repair",
          label: "Book now",
        }}
        secondary={{ href: "/services", label: "All services" }}
      />
    </main>
  );
}
