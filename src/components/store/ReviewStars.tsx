import { Star } from "lucide-react";

export default function ReviewStars({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={1.5}
          className={
            n <= rating ? "fill-vb-accent text-vb-accent" : "text-vb-line"
          }
        />
      ))}
    </div>
  );
}
