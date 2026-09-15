import Link from "next/link";

/** Reusable three-step process strip for services / courier marketing */
export function HowItWorks({
  eyebrow = "How it works",
  title,
  steps,
}: {
  eyebrow?: string;
  title: string;
  steps: { step: string; title: string; body: string }[];
}) {
  return (
    <section className="border-b border-vb-line bg-vb-white py-16 sm:py-20">
      <div className="vb-container">
        <p className="vb-eyebrow">{eyebrow}</p>
        <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {title}
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((s) => (
            <li key={s.step} className="border-t border-vb-line pt-6">
              <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-vb-accent">
                {s.step}
              </span>
              <h3 className="mt-3 font-heading text-lg font-bold uppercase tracking-tight">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-vb-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ClosingCta({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="bg-vb-ink py-16 text-vb-paper sm:py-20">
      <div className="vb-container flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-vb-paper/65">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={primary.href}
            className="inline-flex h-11 items-center bg-vb-accent px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover"
          >
            {primary.label}
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex h-11 items-center border border-vb-paper/30 px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:border-vb-paper"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
