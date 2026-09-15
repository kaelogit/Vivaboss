import Link from "next/link";

export default function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-vb-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-vb-muted">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex h-10 items-center bg-vb-ink px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-paper transition-colors hover:bg-vb-accent"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function AdminEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="border border-dashed border-vb-line bg-vb-white px-6 py-16 text-center">
      <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-vb-ink">
        {title}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm text-vb-muted">{body}</p>
    </div>
  );
}
