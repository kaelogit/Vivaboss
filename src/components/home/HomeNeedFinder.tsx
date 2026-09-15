"use client";

import { useState } from "react";
import Link from "next/link";

type Path = "shop" | "services" | "courier";

const paths: { id: Path; label: string; hint: string }[] = [
  {
    id: "shop",
    label: "I want to buy something",
    hint: "Fashion, gifts, smart home, or home & DIY",
  },
  {
    id: "services",
    label: "I need someone to come to me",
    hint: "Repairs, installs, or smart-home setup",
  },
  {
    id: "courier",
    label: "I need something moved",
    hint: "Medical, legal, flowers, or general delivery",
  },
];

const shopOptions = [
  { href: "/shop/fashion", label: "Fashion & accessories" },
  { href: "/shop/personalised", label: "Personalised gifts" },
  { href: "/shop/smart-home", label: "Smart home products" },
  { href: "/shop/home-diy", label: "Home & DIY" },
];

const serviceOptions = [
  { href: "/services/home", label: "Home repairs & installs" },
  { href: "/services/smart-home", label: "Smart home setup" },
  { href: "/services/book", label: "Book a visit now" },
];

const courierOptions = [
  { href: "/courier/book?vertical=medical", label: "Medical delivery" },
  { href: "/courier/book?vertical=legal", label: "Legal documents" },
  {
    href: "/courier/book?vertical=flowers_events",
    label: "Flowers & events",
  },
  { href: "/courier/book?vertical=general", label: "General package" },
];

export default function HomeNeedFinder() {
  const [path, setPath] = useState<Path | null>(null);

  const options =
    path === "shop"
      ? shopOptions
      : path === "services"
        ? serviceOptions
        : path === "courier"
          ? courierOptions
          : [];

  return (
    <section className="border-b border-vb-line bg-vb-paper py-20 sm:py-24">
      <div className="vb-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
        <div data-vb-reveal="up">
          <p className="vb-eyebrow">Not sure where to start?</p>
          <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Vivaboss finder
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vb-muted">
            Answer one quick question. We’ll point you to the right door — shop,
            services, or courier — without the guesswork.
          </p>
          {path && (
            <button
              type="button"
              onClick={() => setPath(null)}
              className="mt-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
            >
              ← Start again
            </button>
          )}
        </div>

        <div
          className="border border-vb-line bg-vb-white p-6 sm:p-8"
          data-vb-reveal="up"
          data-vb-reveal-delay={80}
        >
          {!path ? (
            <ul className="space-y-3">
              {paths.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setPath(item.id)}
                    className="group flex w-full flex-col border border-vb-line px-5 py-5 text-left transition-colors hover:border-vb-accent hover:bg-vb-mist/60"
                  >
                    <span className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-vb-ink group-hover:text-vb-accent">
                      {item.label}
                    </span>
                    <span className="mt-1 text-sm text-vb-muted">
                      {item.hint}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-vb-muted">
                Next step
              </p>
              <ul className="mt-4 divide-y divide-vb-line border-y border-vb-line">
                {options.map((opt) => (
                  <li key={opt.href}>
                    <Link
                      href={opt.href}
                      className="flex items-center justify-between gap-4 py-4 font-heading text-sm font-semibold uppercase tracking-[0.12em] text-vb-ink transition-colors hover:text-vb-accent"
                    >
                      <span>{opt.label}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
