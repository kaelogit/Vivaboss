import Image from "next/image";
import ReviewStars from "@/components/store/ReviewStars";
import type { PublicReview } from "@/lib/reviews/queries";

export default function ReviewsList({
  reviews,
  emptyMessage = "No reviews yet.",
  showScope = false,
}: {
  reviews: PublicReview[];
  emptyMessage?: string;
  showScope?: boolean;
}) {
  if (!reviews.length) {
    return (
      <p className="border border-dashed border-vb-line bg-vb-paper px-5 py-10 text-center text-sm text-vb-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-vb-line border-y border-vb-line">
      {reviews.map((review) => (
        <li key={review.id} className="py-7 sm:py-8">
          <ReviewStars rating={review.rating} />
          {showScope && review.scope_label && (
            <p className="mt-2 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-accent">
              {review.scope_label}
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-vb-ink sm:text-[15px]">
            “{review.body}”
          </p>
          {review.image_url && (
            <div className="relative mt-4 aspect-[4/3] max-w-sm overflow-hidden bg-vb-mist">
              <Image
                src={review.image_url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 384px"
                className="object-cover"
              />
            </div>
          )}
          <p className="mt-3 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
            {review.author_name}
            <span className="mx-2 text-vb-line">·</span>
            <time dateTime={review.created_at}>
              {new Date(review.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </p>
        </li>
      ))}
    </ul>
  );
}
