import ReviewForm from "@/components/store/ReviewForm";
import ReviewsList from "@/components/store/ReviewsList";
import type { PublicReview } from "@/lib/reviews/queries";
import type { ReviewServiceType } from "@/lib/reviews/scope";

type Props = {
  title?: string;
  reviews: PublicReview[];
  productId?: string;
  serviceType?: ReviewServiceType;
  emptyMessage?: string;
};

export default function ScopedReviewsSection({
  title = "Reviews",
  reviews,
  productId,
  serviceType,
  emptyMessage = "No reviews yet.",
}: Props) {
  return (
    <section className="border-b border-vb-line bg-vb-white py-14 sm:py-20">
      <div className="vb-container grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="vb-eyebrow">Reviews</p>
          <h2 className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            {title}
          </h2>
          <div className="mt-8">
            <ReviewsList reviews={reviews} emptyMessage={emptyMessage} />
          </div>
        </div>
        <div id="write-review" className="scroll-mt-28">
          <p className="vb-eyebrow">Write a review</p>
          <div className="mt-6">
            <ReviewForm productId={productId} serviceType={serviceType} />
          </div>
        </div>
      </div>
    </section>
  );
}
