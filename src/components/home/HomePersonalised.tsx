import Image from "next/image";
import Link from "next/link";
import { marketingImages } from "@/lib/content/marketingImages";

const beats = [
  "Name & message engraving",
  "Photos on wood · portraits on metal",
  "Leather keyholders & metal tags",
  "Memorial & anniversary pieces",
  "Ready-to-order or custom request",
] as const;

export default function HomePersonalised() {
  return (
    <section className="border-b border-vb-line bg-vb-white">
      <div className="grid lg:grid-cols-2 lg:min-h-[640px]">
        <div
          className="relative min-h-[320px] overflow-hidden bg-vb-mist sm:min-h-[420px] lg:min-h-full"
          data-vb-reveal="fade"
        >
          <Image
            src={marketingImages.shop.personalised}
            alt="Handmade Africa-shaped wall clock"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-center bg-vb-white px-6 py-16 sm:px-10 sm:py-20 lg:px-16 xl:px-20">
          <div className="max-w-md" data-vb-reveal="up">
            <p className="vb-eyebrow">Personalised</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              Made for someone. Kept forever.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-vb-muted">
              Turn names, pictures, memories, and special moments into something
              you can keep. Configure ready gifts in the shop — or send a custom
              request when the piece needs a design review first.
            </p>
            <ul className="mt-8 space-y-0 border-y border-vb-line">
              {beats.map((line) => (
                <li
                  key={line}
                  className="border-b border-vb-line py-3.5 text-sm text-vb-ink last:border-b-0"
                >
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/shop/personalised"
                className="inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
              >
                Explore gifts
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-vb-ink hover:text-vb-paper"
              >
                Custom request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
