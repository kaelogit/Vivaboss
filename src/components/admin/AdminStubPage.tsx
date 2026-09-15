import Link from "next/link";

const STEP_HINTS: Record<string, string> = {
  Inventory: "Step 6 · stock adjustments after commerce lands",
  Orders: "Step 5–6 · Stripe orders + fulfilment",
  "Custom Requests": "Step 5 · quote queue from approval products",
  "Service Jobs": "Step 7 · booking forms → job board",
  "Courier Jobs": "Step 7 · delivery bookings → job board",
  Customers: "Step 6+ · unified from orders & bookings",
  Homepage: "Step 8 · CMS for hero & path chooser",
  FAQ: "Step 8 · CMS Q&A",
  Pages: "Step 8 · About / contact CMS",
  Settings: "Step 8 · contact, shipping, notifications",
};

export default function AdminStubPage({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  const hint = STEP_HINTS[title];

  return (
    <div>
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

      <div className="border border-dashed border-vb-line bg-vb-white px-6 py-16 text-center">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-vb-ink">
          Module reserved
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-vb-muted">
          Navigation and IA are complete so nothing feels missing. Data, forms,
          and workflows for this module ship in a later step — not a dead end.
        </p>
        {hint && (
          <p className="mt-4 font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-accent">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
