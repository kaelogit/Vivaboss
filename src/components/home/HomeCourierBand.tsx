import Image from "next/image";
import Link from "next/link";
import { courierCare, courierVerticals } from "@/lib/content/marketing";
import {
  courierVerticalImages,
  marketingImages,
} from "@/lib/content/marketingImages";

export default function HomeCourierBand() {
  return (
    <section className="border-b border-vb-line bg-vb-white py-20 sm:py-24">
      <div className="vb-container">
        <div
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          data-vb-reveal="up"
        >
          <div className="max-w-2xl">
            <p className="vb-eyebrow">Courier</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              We move what matters
            </h2>
            <p className="mt-4 text-base leading-relaxed text-vb-muted sm:text-lg">
              Medical, legal, flowers & events, and general delivery — handled
              with care across the UK. Tell us pickup, drop-off, and urgency;
              we confirm before we move.
            </p>
          </div>
          <Link
            href="/courier/book"
            className="inline-flex h-11 shrink-0 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
          >
            Book a delivery
          </Link>
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {courierVerticals.map((v, i) => {
            const image =
              courierVerticalImages[v.title] ?? marketingImages.courier.medical;
            return (
              <li
                key={v.title}
                data-vb-reveal="scale"
                data-vb-reveal-delay={i * 80}
              >
                <Link
                  href={v.href}
                  className="group relative block min-h-[18rem] overflow-hidden bg-vb-mist sm:min-h-[20rem]"
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-vb-ink/85 via-vb-ink/30 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-vb-paper">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-vb-paper/70 line-clamp-3">
                      {v.blurb}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <ul
          className="mt-12 grid border-t border-vb-line sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-vb-line"
          data-vb-reveal="up"
        >
          {courierCare.map((line, i) => (
            <li
              key={line}
              className={`border-b border-vb-line px-0 py-6 text-sm leading-relaxed text-vb-muted sm:px-6 lg:border-b-0 ${
                i >= 2 ? "sm:border-t sm:border-vb-line lg:border-t-0" : ""
              }`}
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
