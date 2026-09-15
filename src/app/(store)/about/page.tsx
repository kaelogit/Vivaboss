import Image from "next/image";
import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import { ClosingCta } from "@/components/store/MarketingBlocks";
import {
  aboutArms,
  aboutPageStory,
  brandLines,
  founderStoryLong,
} from "@/lib/content/marketing";
import { marketingImages } from "@/lib/content/marketingImages";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `${siteConfig.name} — ${brandLines.founded}`,
};

export default async function AboutPage() {
  const intro = aboutPageStory.intro;

  return (
    <main>
      <SectionIntro
        eyebrow="About"
        title={siteConfig.shortName}
        description={brandLines.founded}
        image={marketingImages.ecosystem}
        imageAlt="Vivaboss Fusion — craft, home, and delivery"
      >
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-vb-paper/75 sm:text-lg">
          {intro}
        </p>
      </SectionIntro>

      <section className="border-b border-vb-line bg-vb-white">
        <div className="grid gap-px bg-vb-line sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              src: marketingImages.craft.workshopAlt,
              alt: "Workshop craft atmosphere",
            },
            {
              src: marketingImages.craft.workshop,
              alt: "Leather workshop craft",
            },
            {
              src: marketingImages.craft.materials,
              alt: "Craft materials still life",
            },
            {
              src: marketingImages.craft.fashionBag,
              alt: "Handmade fashion bag",
            },
            {
              src: marketingImages.craft.engraving,
              alt: "Personalised engraving craft",
            },
          ].map((shot) => (
            <div
              key={shot.src}
              className="relative aspect-[4/3] overflow-hidden bg-vb-mist"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
        <div className="vb-container max-w-3xl">
          <p className="vb-eyebrow">Our story</p>
          <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Culture. Creativity. Honest work.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-vb-muted sm:text-[17px]">
            {aboutPageStory.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
            <p>{aboutPageStory.closing}</p>
            <p className="font-heading text-lg font-semibold uppercase tracking-tight text-vb-ink">
              {aboutPageStory.signature}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-paper py-16 sm:py-20">
        <div className="vb-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden bg-vb-mist lg:sticky lg:top-24">
            <Image
              src={marketingImages.craft.workshopAlt}
              alt="Habeeb — Vivaboss craftsmanship"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="vb-eyebrow">{founderStoryLong.eyebrow}</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              {founderStoryLong.title}
            </h2>
            <p className="mt-4 font-heading text-sm font-semibold uppercase tracking-[0.14em] text-vb-accent">
              {founderStoryLong.lead}
            </p>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-vb-muted sm:text-[17px]">
              {founderStoryLong.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
              <p className="font-heading text-lg font-semibold uppercase tracking-tight text-vb-ink">
                {founderStoryLong.closing}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
        <div className="vb-container">
          <p className="vb-eyebrow">Arms of the business</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            How Vivaboss shows up
          </h2>
          <ul className="mt-12 divide-y divide-vb-line border-y border-vb-line">
            {aboutArms.map((arm) => (
              <li
                key={arm.href}
                className="grid gap-4 py-8 sm:grid-cols-[1fr_auto] sm:items-end"
              >
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase tracking-tight">
                    {arm.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-vb-muted sm:text-[15px]">
                    {arm.body}
                  </p>
                </div>
                <Link
                  href={arm.href}
                  className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
                >
                  {arm.cta} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-vb-line bg-vb-paper py-16 sm:py-20">
        <div className="vb-container grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="vb-eyebrow">Coverage</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight">
              Darlington and beyond
            </h2>
            <p className="mt-4 text-base leading-relaxed text-vb-muted">
              Shop orders ship across the United Kingdom. Service visits and
              courier runs are booked with your postcode so we can confirm
              timing, access, and care requirements before we move.
            </p>
          </div>
          <div>
            <p className="vb-eyebrow">Working with us</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight">
              Shop · Book · Talk
            </h2>
            <ul className="mt-6 space-y-4 text-sm text-vb-muted">
              <li className="border-b border-vb-line pb-4">
                Browse the shop for fashion, gifts, smart home, and home & DIY.
              </li>
              <li className="border-b border-vb-line pb-4">
                Book a repair, install, or courier online — we confirm by email.
              </li>
              <li>
                Prefer a conversation? Use Contact or WhatsApp when our number
                is live.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <ClosingCta
        title="Ready when you are"
        body="Explore the shop, book a visit, or send a message — one brand, clear next steps."
        primary={{ href: "/shop", label: "Explore shop" }}
        secondary={{ href: "/contact", label: "Contact" }}
      />
    </main>
  );
}
