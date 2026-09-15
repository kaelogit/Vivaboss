import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function HomeClosing() {
  return (
    <section className="bg-vb-ink py-20 text-vb-paper sm:py-24">
      <div className="vb-container grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
        <div data-vb-reveal="up">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-vb-accent">
            {siteConfig.homepageLine}
          </p>
          <h2 className="mt-4 max-w-2xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
            Ready when you are
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-vb-paper/65">
            Explore the shop, book a visit, or send a courier request — one
            brand, clear next steps, and a team that confirms before we move.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-3 lg:justify-end"
          data-vb-reveal="up"
          data-vb-reveal-delay={80}
        >
          <Link
            href="/shop"
            className="inline-flex h-12 items-center bg-vb-accent px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover"
          >
            Explore shop
          </Link>
          <Link
            href="/services/book"
            className="inline-flex h-12 items-center border border-vb-paper/35 px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:border-vb-paper"
          >
            Book a service
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center border border-vb-paper/35 px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:border-vb-paper"
          >
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}
