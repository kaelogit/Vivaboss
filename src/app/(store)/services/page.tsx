import Image from "next/image";
import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import {
  ClosingCta,
  HowItWorks,
} from "@/components/store/MarketingBlocks";
import { serviceHowItWorks } from "@/lib/content/marketing";
import { marketingImages } from "@/lib/content/marketingImages";
import { serviceArms, whatsappHref } from "@/lib/navigation";
import { isWhatsAppLive } from "@/lib/site";

const armImages: Record<string, string> = {
  home: marketingImages.services.sofa,
  "smart-home": marketingImages.services.smartLock,
};

export const metadata = {
  title: "Services",
  description:
    "Home repairs, installations, and smart-home setup across the UK — book online with Vivaboss Fusion Services.",
};

export default function ServicesPage() {
  const waLive = isWhatsAppLive();

  return (
    <main>
      <SectionIntro
        eyebrow="Services"
        title="Home & smart services"
        description="Need something fixed, installed, or made smarter? Book a visit — we cover the whole UK, confirm by email, and cross-sell shop hardware when you need gear too."
        image={marketingImages.services.plumbingHero}
        imageAlt="Under-sink plumbing repair in a UK kitchen"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/services/book"
            className="inline-flex h-11 items-center bg-vb-accent px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover"
          >
            Book a service
          </Link>
          {waLive ? (
            <a
              href={whatsappHref(
                "Hi Vivaboss — I'd like to book a home service."
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

      <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
        <div className="vb-container">
          <p className="vb-eyebrow">Choose an arm</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Two ways we come to you
          </h2>
          <ul className="mt-12 grid gap-0 border-t border-vb-line md:grid-cols-2">
            {serviceArms.map((arm, i) => (
              <li
                key={arm.slug}
                className={`border-b border-vb-line py-10 md:border-b-0 ${
                  i === 0 ? "md:border-r md:pr-10" : "md:pl-10"
                }`}
              >
                <Link href={arm.href} className="group block">
                  {armImages[arm.slug] && (
                    <div className="relative mb-6 aspect-[16/10] overflow-hidden bg-vb-mist">
                      <Image
                        src={armImages[arm.slug]}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  )}
                  <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-vb-muted">
                    0{i + 1}
                  </span>
                  <span className="mt-4 block font-heading text-2xl font-bold uppercase tracking-tight group-hover:text-vb-accent">
                    {arm.label}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-vb-muted">
                    {arm.blurb}
                  </span>
                  <span className="mt-8 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent">
                    Explore →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HowItWorks
        title="From request to visit"
        steps={[...serviceHowItWorks]}
      />

      <section className="border-b border-vb-line bg-vb-ink">
        <div className="grid gap-px bg-vb-line/20 sm:grid-cols-2 lg:grid-cols-4">
          {[
            marketingImages.services.tv,
            marketingImages.services.sofa,
            marketingImages.services.plumbing,
            marketingImages.services.furniture,
          ].map((src) => (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden bg-vb-ink"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
        <div className="vb-container">
          <p className="vb-eyebrow">What to expect</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Clear before we arrive
          </h2>
          <ul className="mt-12 grid gap-0 border-t border-vb-line md:grid-cols-3">
            {[
              {
                title: "Postcode first",
                body: "Every booking starts with your postcode and preferred window so we can confirm travel before we commit.",
              },
              {
                title: "Photos help",
                body: "Attach a quick shot of the job — TV wall, lock, leak, or lighting — and we arrive better prepared.",
              },
              {
                title: "Confirmed by email",
                body: "You’ll get confirmation and follow-up if we need access notes, materials, or a different slot.",
              },
            ].map((item, i) => (
              <li
                key={item.title}
                className={`border-b border-vb-line py-10 md:border-b-0 ${
                  i < 2 ? "md:border-r md:pr-10" : ""
                } ${i > 0 ? "md:pl-10" : ""}`}
              >
                <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-vb-accent">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-heading text-xl font-bold uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-vb-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-paper py-16 sm:py-20">
        <div className="vb-container grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden bg-vb-mist">
            <Image
              src={marketingImages.shop.smartHome}
              alt="Smart home products for install"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="vb-eyebrow">Shop × services</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight">
              Buy the kit. Book the install.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-vb-muted sm:text-[15px]">
              Smart locks, cameras, lighting, and home equipment live in the
              shop. Need them fitted? Add installation where offered, or book a
              service visit on its own — same Vivaboss standard either way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop/smart-home"
                className="inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
              >
                Shop smart home
              </Link>
              <Link
                href="/shop/home-diy"
                className="inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-vb-ink hover:text-vb-paper"
              >
                Shop home & DIY
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="Ready to book?"
        body="Tell us the job and postcode — we’ll confirm the window and next steps."
        primary={{ href: "/services/book", label: "Book a service" }}
        secondary={{ href: "/faq", label: "Read FAQ" }}
      />
    </main>
  );
}
