"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col bg-vb-paper">
      <div className="vb-container flex flex-1 flex-col justify-center py-24">
        <p className="vb-eyebrow">Error</p>
        <h1 className="mt-3 max-w-xl font-heading text-4xl font-extrabold uppercase tracking-tight text-vb-ink sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-md text-vb-muted">
          We hit an unexpected issue loading this page. Try again, or go back
          home.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em]"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
