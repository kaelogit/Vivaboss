import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import ReviewForm from "@/components/store/ReviewForm";
import ReviewsList from "@/components/store/ReviewsList";
import { listPublishedReviews } from "@/lib/reviews/queries";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Reviews",
  description: `Read customer reviews of ${siteConfig.name}, or leave your own.`,
};

export default async function ReviewsPage() {
  const reviews = await listPublishedReviews();

  return (
    <main>
      <SectionIntro
        eyebrow="Reviews"
        title="From people who used Vivaboss"
        description="Honest notes from shoppers, service bookings, and courier runs across the UK."
      />

      <section className="border-b border-vb-line bg-vb-white py-14 sm:py-20">
        <div className="vb-container grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="vb-eyebrow">All reviews</p>
                <h2 className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                  {reviews.length
                    ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                    : "Customer reviews"}
                </h2>
              </div>
              <a
                href="#write"
                className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent lg:hidden"
              >
                Give a review →
              </a>
            </div>
            <div className="mt-8">
              <ReviewsList reviews={reviews} />
            </div>
          </div>

          <div id="write" className="scroll-mt-28">
            <p className="vb-eyebrow">Give a review</p>
            <h2 className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight">
              Share your experience
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-vb-muted">
              A name, a star rating, and a short note — that’s all we need.
            </p>
            <div className="mt-6">
              <ReviewForm />
            </div>
            <p className="mt-6 text-xs text-vb-muted">
              Prefer another route?{" "}
              <Link href="/contact" className="text-vb-accent hover:underline">
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
