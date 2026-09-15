import Image from "next/image";
import Link from "next/link";
import { serviceHowItWorks } from "@/lib/content/marketing";
import { marketingImages } from "@/lib/content/marketingImages";
import { serviceArms } from "@/lib/navigation";

const shots = [
  marketingImages.services.tv,
  marketingImages.services.painting,
  marketingImages.services.plumbing,
  marketingImages.services.lighting,
] as const;

export default function HomeServicesBand() {
  return (
    <section className="border-b border-vb-line bg-vb-paper">
      <div className="grid gap-px bg-vb-line sm:grid-cols-2 lg:grid-cols-4">
        {shots.map((src, i) => (
          <div
            key={src}
            className={`relative aspect-[4/3] overflow-hidden bg-vb-mist ${
              i > 1 ? "hidden sm:block" : ""
            }`}
            data-vb-reveal="fade"
            data-vb-reveal-delay={i * 60}
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

      <div className="vb-container py-20 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div data-vb-reveal="up">
            <p className="vb-eyebrow">Services</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              We come to you
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-vb-muted sm:text-lg">
              From handyman fixes to smart-home setup — booked online, confirmed
              by our team, covered across the UK. Buy the kit in the shop when
              you need hardware too.
            </p>

            <ul className="mt-10 space-y-0 border-y border-vb-line">
              {serviceArms.map((arm) => (
                <li key={arm.slug} className="border-b border-vb-line last:border-b-0">
                  <Link
                    href={arm.href}
                    className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                  >
                    <span className="font-heading text-lg font-bold uppercase tracking-tight group-hover:text-vb-accent">
                      {arm.label}
                    </span>
                    <span className="max-w-sm text-sm text-vb-muted sm:text-right">
                      {arm.blurb}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/services/book"
                className="inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
              >
                Book a service
              </Link>
              <Link
                href="/services"
                className="inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-vb-ink hover:text-vb-paper"
              >
                Explore services
              </Link>
            </div>
          </div>

          <div data-vb-reveal="up" data-vb-reveal-delay={90}>
            <p className="vb-eyebrow">How a visit works</p>
            <h3 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight">
              Request → confirm → attend
            </h3>
            <ol className="mt-8 space-y-8">
              {serviceHowItWorks.map((step) => (
                <li key={step.step} className="flex gap-5">
                  <span className="font-heading text-sm font-bold text-vb-accent">
                    {step.step}
                  </span>
                  <div>
                    <p className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-vb-ink">
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-vb-muted">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
