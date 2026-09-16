import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** Full-bleed header image from /public */
  image?: string;
  imageAlt?: string;
};

/** Shared intro for public section pages — calm, editorial, not a card dump */
export default function SectionIntro({
  eyebrow,
  title,
  description,
  children,
  className,
  image,
  imageAlt = "",
}: Props) {
  if (image) {
    return (
      <header
        className={cn(
          "relative isolate overflow-hidden border-b border-vb-line",
          className
        )}
      >
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%] sm:object-center"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,17,16,0.45)_0%,rgba(18,17,16,0.72)_55%,rgba(18,17,16,0.88)_100%)] sm:bg-[linear-gradient(105deg,rgba(18,17,16,0.88)_0%,rgba(18,17,16,0.72)_48%,rgba(18,17,16,0.45)_100%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_20%,rgba(180,83,42,0.2)_0%,transparent_50%)]"
          />
        </div>
        <div className="vb-container relative py-16 sm:py-24 lg:py-28" data-vb-reveal="up">
          {eyebrow && (
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-vb-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 max-w-3xl font-heading text-[2.35rem] font-extrabold uppercase tracking-tight text-vb-paper sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-vb-paper/70 sm:mt-5 sm:text-lg">
              {description}
            </p>
          )}
          {children}
        </div>
      </header>
    );
  }

  return (
    <header className={cn("border-b border-vb-line bg-vb-paper", className)}>
      <div className="vb-container py-16 sm:py-20 lg:py-24" data-vb-reveal="up">
        {eyebrow && <p className="vb-eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl font-heading text-4xl font-extrabold uppercase tracking-tight text-vb-ink sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-vb-muted sm:text-lg">
            {description}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}

export function LinkList({
  items,
}: {
  items: { href: string; label: string; blurb?: string }[];
}) {
  return (
    <ul className="divide-y divide-vb-line border-y border-vb-line">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="group flex flex-col gap-1 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
          >
            <span className="font-heading text-lg font-semibold uppercase tracking-tight text-vb-ink group-hover:text-vb-accent sm:text-xl">
              {item.label}
            </span>
            {item.blurb && (
              <span className="max-w-md text-sm text-vb-muted sm:text-right">
                {item.blurb}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ComingOnlineNote({ note }: { note?: string }) {
  return (
    <p className="mt-10 max-w-xl border-l-2 border-vb-accent pl-4 text-sm text-vb-muted">
      {note ?? "More from this section is on the way."}
    </p>
  );
}
