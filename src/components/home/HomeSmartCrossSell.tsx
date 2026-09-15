import Image from "next/image";
import Link from "next/link";
import { marketingImages } from "@/lib/content/marketingImages";

export default function HomeSmartCrossSell() {
  return (
    <section className="border-b border-vb-line bg-vb-ink text-vb-paper">
      <div className="grid lg:grid-cols-2 lg:min-h-[560px]">
        <div className="flex items-center px-6 py-16 sm:px-10 sm:py-20 lg:px-16 xl:px-20">
          <div className="max-w-md" data-vb-reveal="up">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-vb-accent">
              Shop × services
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              Buy the kit. Book the install.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-vb-paper/65">
              Smart locks, cameras, lighting, and home equipment live in the
              shop. Need them fitted? Add installation where offered, or book a
              service visit on its own — same Vivaboss standard either way.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/shop/smart-home"
                className="inline-flex h-11 items-center bg-vb-accent px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover"
              >
                Shop smart home
              </Link>
              <Link
                href="/services/smart-home"
                className="inline-flex h-11 items-center border border-vb-paper/35 px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:border-vb-paper"
              >
                Book installation
              </Link>
            </div>
          </div>
        </div>
        <div
          className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:min-h-full"
          data-vb-reveal="fade"
        >
          <Image
            src={marketingImages.services.smartLock}
            alt="Smart home hardware ready for install"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
