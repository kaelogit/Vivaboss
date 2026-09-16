"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Star, Trash2 } from "lucide-react";
import type { Review } from "@/types/database";

type Filter = "all" | "pending" | "published";

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

function statusLabel(review: Review): string {
  if (review.is_published) return "Published";
  return "Pending / hidden";
}

export default function ReviewsAdminClient({
  reviews: initial,
}: {
  reviews: Review[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    switch (filter) {
      case "pending":
        return reviews.filter((r) => !r.is_published);
      case "published":
        return reviews.filter((r) => r.is_published);
      default:
        return reviews;
    }
  }, [reviews, filter]);

  const counts = useMemo(() => {
    const pending = reviews.filter((r) => !r.is_published).length;
    return {
      all: reviews.length,
      pending,
      published: reviews.length - pending,
    };
  }, [reviews]);

  const setPublished = async (id: string, is_published: boolean) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published }),
      });
      const data = (await res.json()) as { review?: Review; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      if (data.review) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? data.review! : r))
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setBusyId(id);
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
      setBusyId(null);
    }
  };

  if (!reviews.length) {
    return (
      <div className="border border-dashed border-vb-line bg-vb-white px-6 py-16 text-center">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em]">
          No reviews yet
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-vb-muted">
          When customers submit reviews, they land here as pending until you
          approve them for the public site.
        </p>
      </div>
    );
  }

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "published", label: "Published", count: counts.published },
  ];

  return (
    <div>
      {error && (
        <p className="mb-4 border border-vb-danger/30 bg-vb-danger/5 px-4 py-3 text-sm text-vb-danger">
          {error}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`h-9 border px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] ${
              filter === tab.key
                ? "border-vb-ink bg-vb-ink text-vb-paper"
                : "border-vb-line bg-vb-white text-vb-ink hover:border-vb-ink"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="border border-dashed border-vb-line bg-vb-white px-6 py-12 text-center text-sm text-vb-muted">
          Nothing in this filter.
        </div>
      ) : (
        <ul className="divide-y divide-vb-line border border-vb-line bg-vb-white">
          {filtered.map((review) => {
            const busy = busyId === review.id;
            return (
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
                      <span className="text-xs text-vb-muted">
                        {review.email}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-heading font-semibold uppercase tracking-[0.14em] ${
                        review.is_published
                          ? "text-vb-accent"
                          : "text-vb-muted"
                      }`}
                    >
                      {statusLabel(review)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-vb-ink">
                    {review.body}
                  </p>
                  <p className="mt-2 text-xs text-vb-muted">
                    {new Date(review.created_at).toLocaleString("en-GB")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {review.is_published ? (
                    <button
                      type="button"
                      onClick={() => setPublished(review.id, false)}
                      disabled={busy}
                      className="inline-flex h-10 items-center gap-2 border border-vb-line px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-ink hover:border-vb-ink disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <EyeOff size={14} />
                      )}
                      Hide
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPublished(review.id, true)}
                      disabled={busy}
                      className="inline-flex h-10 items-center gap-2 border border-vb-accent bg-vb-accent/10 px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-accent hover:bg-vb-accent hover:text-white disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Eye size={14} />
                      )}
                      Approve
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(review.id)}
                    disabled={busy}
                    className="inline-flex h-10 items-center gap-2 border border-vb-danger/40 px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-danger hover:bg-vb-danger hover:text-white disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
