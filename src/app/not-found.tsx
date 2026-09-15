import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col bg-vb-paper">
      <div className="vb-container flex flex-1 flex-col justify-center py-24">
        <p className="vb-eyebrow">404</p>
        <h1 className="mt-3 max-w-xl font-heading text-4xl font-extrabold uppercase tracking-tight text-vb-ink sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-vb-muted">
          That link doesn&apos;t lead anywhere on {siteConfig.shortName}. Head
          back home or browse the shop.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em]"
          >
            Shop
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center border border-vb-line px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-muted hover:text-vb-ink"
          >
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
