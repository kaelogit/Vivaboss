import Image from "next/image";
import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import {
  ClosingCta,
  HowItWorks,
} from "@/components/store/MarketingBlocks";
import {
  courierCare,
  courierHowItWorks,
  courierVerticals,
} from "@/lib/content/marketing";
import {
  courierVerticalImages,
  marketingImages,
} from "@/lib/content/marketingImages";
import { whatsappHref } from "@/lib/navigation";
import { isWhatsAppLive } from "@/lib/site";

export const metadata = {
  title: "Courier",
  description:
    "Medical, legal, flower & event, and general courier delivery across the UK — book with Vivaboss Fusion Services.",
};

export default function CourierPage() {
  const waLive = isWhatsAppLive();

  return (
    <main>
      <SectionIntro
        eyebrow="Courier"
        title="Fast, safe, reliable"
        description="Whatever you’re sending, we handle it with care and make sure it gets where it needs to go — safely and on time across the UK."
        image={marketingImages.courier.legal}
        imageAlt="Careful document and courier handling"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/courier/book"
            className="inline-flex h-11 items-center bg-vb-accent px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover"
          >
            Book a delivery
          </Link>
          {waLive ? (
            <a
              href={whatsappHref("Hi Vivaboss — I need a courier delivery.")}
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

      <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
        <div className="vb-container">
          <p className="vb-eyebrow">What we move</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Verticals with care built in
          </h2>
          <ul className="mt-12 grid gap-10 sm:grid-cols-2">
            {courierVerticals.map((v) => {
              const image = courierVerticalImages[v.title];
              return (
                <li key={v.title} className="border-t border-vb-line pt-6">
                  {image && (
                    <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-vb-mist">
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-vb-ink">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-vb-muted">
                    {v.blurb}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {v.items.map((item) => (
                      <li key={item} className="text-sm text-vb-ink">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={v.href}
                    className="mt-6 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
                  >
                    Book this type →
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <HowItWorks
        title="How courier booking works"
        steps={[...courierHowItWorks]}
      />

      <section className="border-b border-vb-line bg-vb-paper py-16 sm:py-20">
        <div className="vb-container grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="vb-eyebrow">Care standards</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight">
              We move what matters
            </h2>
            <ul className="mt-8 space-y-4">
              {courierCare.map((line) => (
                <li
                  key={line}
                  className="border-b border-vb-line pb-4 text-sm text-vb-ink sm:text-[15px]"
                >
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-vb-muted sm:text-[15px]">
              Fast, safe, and reliable delivery for individuals and businesses
              across the UK. Add urgency on the booking form — standard,
              same-day, or urgent — and include notes for recipients, access, or
              special care.
            </p>
            <Link
              href="/courier/book"
              className="mt-8 inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
            >
              Start a booking
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-vb-mist">
            <Image
              src={marketingImages.courier.medical}
              alt="Careful medical courier handling"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <ClosingCta
        title="Book a Vivaboss delivery"
        body="Pickup, drop-off, item details, and urgency — we confirm by email."
        primary={{ href: "/courier/book", label: "Book a delivery" }}
        secondary={{ href: "/contact", label: "Contact" }}
      />
    </main>
  );
}
