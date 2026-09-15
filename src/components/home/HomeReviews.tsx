import Link from "next/link";
import ReviewsList from "@/components/store/ReviewsList";
import type { PublicReview } from "@/lib/reviews/queries";

export default function HomeReviews({ reviews }: { reviews: PublicReview[] }) {
  return (
    <section className="border-b border-vb-line bg-vb-white py-20 sm:py-24">
      <div className="vb-container">
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          data-vb-reveal="up"
        >
          <div>
            <p className="vb-eyebrow">Reviews</p>
            <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              From people who used Vivaboss
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-vb-muted">
              A short sample of recent feedback — open the full page for every
              review, or leave your own.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/reviews"
              className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
            >
              See all reviews →
            </Link>
            <Link
              href="/reviews#write"
              className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-ink hover:text-vb-accent"
            >
              Give a review →
            </Link>
          </div>
        </div>

        <div className="mt-10" data-vb-reveal="up" data-vb-reveal-delay={80}>
          <ReviewsList
            reviews={reviews}
            emptyMessage="No reviews yet — give a review and be the first."
          />
        </div>
      </div>
    </section>
  );
}
