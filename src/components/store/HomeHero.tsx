import Image from "next/image";
import Link from "next/link";
import { marketingImages } from "@/lib/content/marketingImages";
import { siteConfig } from "@/lib/site";
import type { HomepageContent } from "@/lib/content/siteSettings";

type HeroProps = {
  content?: Pick<
    HomepageContent,
    "heroEyebrow" | "heroHeadline" | "heroSub" | "heroTagline"
  >;
};

/**
 * Hero stack (kept lean on purpose):
 * 1. Brand name — hero-level signal
 * 2. Arms cue — Craft. Home. Delivery.
 * 3. Owner mantra — the one line people remember
 * 4. CTAs
 *
 * Bottom of the image fades into solid ink so the promise strip
 * reads as a continuous extension (same idea as T40’s image→black blend).
 */
export default function HomeHero({ content }: HeroProps) {
  const brand = content?.heroEyebrow ?? siteConfig.name;
  const headline = content?.heroHeadline ?? siteConfig.shortName;
  const arms = content?.heroSub ?? siteConfig.homepageLine;
  const mantra = content?.heroTagline ?? siteConfig.fashionPunchline;

  return (
    <section className="relative isolate overflow-hidden bg-vb-ink">
      <div className="relative min-h-[min(88vh,860px)] sm:min-h-[min(92vh,920px)]">
        <Image
          src={marketingImages.hero.primary}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] sm:object-[68%_center]"
        />

        {/* Readability: side wash on desktop, soft overall on mobile */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,17,16,0.5)_0%,rgba(18,17,16,0.22)_40%,transparent_62%)] sm:bg-[linear-gradient(105deg,rgba(18,17,16,0.9)_0%,rgba(18,17,16,0.68)_40%,rgba(18,17,16,0.2)_66%,transparent_82%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_18%,rgba(180,83,42,0.2)_0%,transparent_42%)]"
        />

        {/*
          Deep dissolve into ink — tall, opaque lower third so the photo
          fully melts before the promise strip (T40-style, stronger).
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[64%] sm:h-[60%] lg:h-[56%]"
          style={{
            background:
              "linear-gradient(to top, #121110 0%, #121110 32%, rgba(18,17,16,0.95) 48%, rgba(18,17,16,0.72) 62%, rgba(18,17,16,0.35) 78%, rgba(18,17,16,0.1) 90%, transparent 100%)",
          }}
        />

        <div className="vb-container relative z-10 flex min-h-[min(88vh,860px)] flex-col justify-end pb-28 pt-24 sm:min-h-[min(92vh,920px)] sm:pb-32 sm:pt-32 lg:justify-center lg:pb-36">
          <p className="vb-fade-up font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-vb-accent">
            {brand}
          </p>

          <h1 className="vb-fade-up vb-fade-up-delay-1 mt-4 max-w-4xl font-heading text-[2.75rem] font-extrabold uppercase leading-[0.92] tracking-tight text-vb-paper sm:mt-5 sm:text-7xl lg:text-8xl">
            {headline}
          </h1>

          <p className="vb-fade-up vb-fade-up-delay-2 mt-4 font-heading text-base font-semibold uppercase tracking-[0.22em] text-vb-paper/80 sm:text-lg">
            {arms}
          </p>

          <p className="vb-fade-up vb-fade-up-delay-3 mt-6 max-w-xl font-heading text-xl font-semibold leading-snug tracking-tight text-vb-paper sm:text-2xl sm:leading-snug">
            {mantra}
          </p>

          <div className="vb-fade-up vb-fade-up-delay-3 mt-10 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center bg-vb-accent px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-vb-accent-hover"
            >
              Explore Shop
            </Link>
            <Link
              href="/services"
              className="inline-flex h-12 items-center border border-vb-paper/25 px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper transition-colors hover:border-vb-paper hover:bg-vb-paper/5"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
