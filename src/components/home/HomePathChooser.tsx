import Image from "next/image";
import Link from "next/link";
import { marketingImages } from "@/lib/content/marketingImages";
import { pathChooser } from "@/lib/navigation";

const pathImages: Record<string, string> = {
  shop: marketingImages.shop.leatherBag,
  services: marketingImages.services.tvHero,
  courier: marketingImages.courier.flowers,
};

type Props = {
  eyebrow?: string;
  title?: string;
};

export default function HomePathChooser({ eyebrow, title }: Props) {
  return (
    <section className="border-b border-vb-line bg-vb-paper py-20 sm:py-24">
      <div className="vb-container">
        <div data-vb-reveal="up">
          <p className="vb-eyebrow">
            {eyebrow ?? "What are you looking for?"}
          </p>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-bold uppercase tracking-tight text-vb-ink sm:text-4xl lg:text-5xl">
            {title ?? "Three ways into Vivaboss"}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-vb-muted">
            One brand. Three clear doors. Pick the path that matches what you need
            today — shop, book a visit, or move something carefully.
          </p>
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {pathChooser.map((door, i) => (
            <li
              key={door.key}
              data-vb-reveal="up"
              data-vb-reveal-delay={i * 80}
            >
              <Link
                href={door.href}
                className="group relative block min-h-[18rem] overflow-hidden bg-vb-ink sm:min-h-[22rem] md:min-h-[26rem]"
              >
                <Image
                  src={pathImages[door.key] ?? marketingImages.ecosystem}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-vb-ink via-vb-ink/55 to-vb-ink/15"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-vb-accent">
                    0{i + 1}
                  </span>
                  <span className="mt-3 block font-heading text-2xl font-bold uppercase tracking-tight text-vb-paper sm:text-3xl">
                    {door.title}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-vb-paper/70">
                    {door.blurb}
                  </span>
                  <span className="mt-6 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper transition-colors group-hover:text-vb-accent">
                    {door.cta} →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
