import Image from "next/image";
import Link from "next/link";
import { brandLines } from "@/lib/content/marketing";
import { marketingImages } from "@/lib/content/marketingImages";

export default function HomeFashionBand() {
  return (
    <section className="relative isolate min-h-[min(78vh,720px)] overflow-hidden border-b border-vb-line">
      <Image
        src={marketingImages.hero.alternate}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(100deg,rgba(18,17,16,0.9)_0%,rgba(18,17,16,0.55)_55%,rgba(18,17,16,0.35)_100%)]"
      />
      <div
        className="vb-container relative flex min-h-[min(78vh,720px)] flex-col justify-end py-16 sm:py-20 lg:justify-center"
        data-vb-reveal="up"
      >
        <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-vb-accent">
          Fashion
        </p>
        <h2 className="mt-5 max-w-3xl font-heading text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-vb-paper sm:text-6xl lg:text-7xl">
          {brandLines.fashion}
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-vb-paper/70 sm:text-lg">
          {brandLines.fashionSub} African creativity meeting modern style —
          leather, shoes, and accessories made to be noticed for the right
          reasons.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/shop/fashion"
            className="inline-flex h-12 items-center bg-vb-accent px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover"
          >
            Shop fashion
          </Link>
          <Link
            href="/about"
            className="inline-flex h-12 items-center border border-vb-paper/30 px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:border-vb-paper"
          >
            Our story
          </Link>
        </div>
      </div>
    </section>
  );
}
