import Image from "next/image";
import Link from "next/link";
import { brandLines } from "@/lib/content/marketing";
import { marketingImages } from "@/lib/content/marketingImages";
import { siteConfig } from "@/lib/site";

type Props = {
  headline?: string;
  body?: string;
};

export default function HomeBrandStory({ headline, body }: Props) {
  return (
    <section className="border-b border-vb-line bg-vb-white">
      <div className="grid lg:grid-cols-2 lg:min-h-[680px]">
        <div
          className="relative min-h-[360px] overflow-hidden bg-vb-mist sm:min-h-[420px] lg:min-h-full"
          data-vb-reveal="fade"
        >
          <Image
            src={marketingImages.craft.workshop}
            alt="Vivaboss craft workshop"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-center px-6 py-16 sm:px-10 sm:py-20 lg:px-16 xl:px-24">
          <div className="max-w-md" data-vb-reveal="up">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-vb-accent">
              About Vivaboss
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              {headline ?? "One umbrella. Many arms. One standard."}
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-vb-muted">
              <p>
                {body ??
                  "Vivaboss Fusion Services spans craft, home, and delivery — handmade fashion and personalised gifts, smart-home and DIY products, repairs and installs, plus careful courier runs across the UK."}
              </p>
              <p>
                Each arm has its own job. Together they share the same promise:{" "}
                {siteConfig.tagline.toLowerCase()}
              </p>
              <p className="font-heading text-lg font-semibold uppercase tracking-tight text-vb-ink">
                {brandLines.attract}
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
