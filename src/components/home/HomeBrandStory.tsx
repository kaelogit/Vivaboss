import Image from "next/image";
import Link from "next/link";
import { homepageFounderStory } from "@/lib/content/marketing";
import { marketingImages } from "@/lib/content/marketingImages";

type Props = {
  /** Optional CMS override for the section headline */
  headline?: string;
};

export default function HomeBrandStory({ headline }: Props) {
  const story = homepageFounderStory;
  const title = headline?.trim() || story.headline;

  return (
    <section className="border-b border-vb-line bg-vb-white">
      <div className="grid lg:grid-cols-2 lg:min-h-[680px]">
        <div
          className="relative min-h-[360px] overflow-hidden bg-vb-mist sm:min-h-[420px] lg:min-h-full"
          data-vb-reveal="fade"
        >
          <Image
            src={marketingImages.founder}
            alt="Habeeb Adewale Adesokan — Founder & Creative Director, Vivaboss Fusion Services"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-[center_20%]"
          />
        </div>
        <div className="flex items-center px-6 py-16 sm:px-10 sm:py-20 lg:px-16 xl:px-24">
          <div className="max-w-lg" data-vb-reveal="up">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-vb-accent">
              {story.eyebrow}
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-vb-muted">
              {story.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
              <p className="font-heading text-lg font-semibold uppercase tracking-tight text-vb-ink">
                {story.closing}
              </p>
            </div>
            <Link
              href="/about"
              className="mt-10 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
            >
              Read our story →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
