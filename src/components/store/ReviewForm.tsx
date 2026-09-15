"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";

export default function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId?: string;
  onSubmitted?: () => void;
}) {
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          email: email || undefined,
          rating,
          body,
          productId,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not send review.");
      setDone(true);
      setAuthorName("");
      setEmail("");
      setBody("");
      setRating(5);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send review.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="border border-vb-line bg-vb-paper px-5 py-8 text-center">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-vb-ink">
          Thank you
        </p>
        <p className="mt-3 text-sm text-vb-muted">
          Your review is live. We appreciate you taking the time.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 border border-vb-line bg-vb-white p-5 sm:p-6">
      <div>
        <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-vb-muted">
          Your rating
        </p>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className="p-0.5 text-vb-line transition-colors"
              >
                <Star
                  size={22}
                  strokeWidth={1.5}
                  className={
                    active
                      ? "fill-vb-accent text-vb-accent"
                      : "text-vb-line"
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      <label className="block text-sm">
        <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
          Name
        </span>
        <input
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="mt-1.5 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm outline-none ring-vb-accent focus:ring-1"
          placeholder="Your name"
          maxLength={80}
        />
      </label>

      <label className="block text-sm">
        <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
          Email <span className="normal-case tracking-normal text-vb-muted/70">(optional)</span>
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm outline-none ring-vb-accent focus:ring-1"
          placeholder="you@email.com"
        />
      </label>

      <label className="block text-sm">
        <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
          Your review
        </span>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm outline-none ring-vb-accent focus:ring-1"
          placeholder="Tell others what stood out — craft, service, delivery…"
        />
      </label>

      {error && <p className="text-sm text-vb-danger">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 items-center gap-2 bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent disabled:opacity-60"
      >
        {busy && <Loader2 size={14} className="animate-spin" />}
        Submit review
      </button>
    </form>
  );
}
