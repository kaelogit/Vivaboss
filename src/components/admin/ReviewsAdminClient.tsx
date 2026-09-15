"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import type { Review } from "@/types/database";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={
            n <= rating
              ? "fill-vb-accent text-vb-accent"
              : "text-vb-line"
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsAdminClient({
  reviews: initial,
}: {
  reviews: Review[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setDeleting(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      setReviews((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  if (!reviews.length) {
    return (
      <div className="border border-dashed border-vb-line bg-vb-white px-6 py-16 text-center">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em]">
          No reviews yet
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-vb-muted">
          When customers submit reviews on the site, they appear here. You can
          delete any review from this panel.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 border border-vb-danger/30 bg-vb-danger/5 px-4 py-3 text-sm text-vb-danger">
          {error}
        </p>
      )}
      <ul className="divide-y divide-vb-line border border-vb-line bg-vb-white">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Stars rating={review.rating} />
                <span className="font-heading text-sm font-semibold uppercase tracking-tight">
                  {review.author_name}
                </span>
                {review.email && (
                  <span className="text-xs text-vb-muted">{review.email}</span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-vb-ink">
                {review.body}
              </p>
              <p className="mt-2 text-xs text-vb-muted">
                {new Date(review.created_at).toLocaleString("en-GB")}
                {!review.is_published ? " · Hidden" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(review.id)}
              disabled={deleting === review.id}
              className="inline-flex h-10 shrink-0 items-center gap-2 border border-vb-danger/40 px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-danger hover:bg-vb-danger hover:text-white disabled:opacity-50"
            >
              {deleting === review.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
