"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import SectionIntro from "@/components/store/SectionIntro";
import { formatGbp } from "@/lib/products/money";
import { lineTotal } from "@/lib/cart/types";
import { PREORDER_LEAD } from "@/lib/products/stock";
import { useCartStore } from "@/store/cart";
import { isValidUkPostcode } from "@/lib/uk/postcode";

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled");
  const lines = useCartStore((s) => s.lines);
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + lineTotal(l), 0),
    [lines]
  );
  const hasPreorder = lines.some((l) => l.isPreorder);

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => setReady(true), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUkPostcode(postcode)) {
      setError("Enter a valid UK postcode.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          addressLine1,
          addressLine2,
          city,
          postcode,
          notes,
          lines,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="vb-container py-12">
        <p className="text-sm text-vb-muted">Loading…</p>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="vb-container py-12 text-center">
        <p className="text-sm text-vb-muted">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
        >
          Browse shop →
        </Link>
      </div>
    );
  }

  return (
    <div className="vb-container py-12 sm:py-16">
      {cancelled && (
        <p className="mb-6 border border-vb-line bg-vb-mist px-4 py-3 text-sm text-vb-muted">
          Checkout was cancelled — your cart is still here when you&apos;re
          ready.
        </p>
      )}

      <form
        onSubmit={submit}
        className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-4 border border-vb-line bg-vb-white p-6 sm:p-8">
          <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
            Delivery details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *" value={fullName} onChange={setFullName} required />
            <Field label="Email *" type="email" value={email} onChange={setEmail} required />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <div className="sm:col-span-2">
              <Field
                label="Address line 1 *"
                value={addressLine1}
                onChange={setAddressLine1}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Address line 2"
                value={addressLine2}
                onChange={setAddressLine2}
              />
            </div>
            <Field label="City *" value={city} onChange={setCity} required />
            <Field
              label="Postcode *"
              value={postcode}
              onChange={setPostcode}
              required
            />
            <div className="sm:col-span-2">
              <label className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
                Order notes
              </label>
              <textarea
                className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-vb-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 bg-vb-accent font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            Pay with Stripe
          </button>
        </div>

        <aside className="border border-vb-line bg-vb-paper p-6 h-fit">
          <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
            Order summary
          </h2>
          {hasPreorder && (
            <p className="mt-3 text-xs leading-relaxed text-vb-muted">
              Includes pre-order items — typically {PREORDER_LEAD} after payment.
            </p>
          )}
          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <span className="text-vb-muted">
                  {line.name} × {line.quantity}
                  {line.isPreorder ? " · Pre-order" : ""}
                </span>
                <span className="text-right">
                  {line.compareAtGbp != null &&
                    line.compareAtGbp > line.unitPriceGbp && (
                      <span className="mr-2 text-xs text-vb-muted line-through">
                        {formatGbp(line.compareAtGbp * line.quantity)}
                      </span>
                    )}
                  <span
                    className={
                      line.compareAtGbp != null &&
                      line.compareAtGbp > line.unitPriceGbp
                        ? "text-vb-accent"
                        : undefined
                    }
                  >
                    {formatGbp(lineTotal(line))}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between border-t border-vb-line pt-4 font-heading text-sm font-semibold">
            <span>Subtotal</span>
            <span>{formatGbp(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-vb-muted">
            UK shipping (incl. Highlands / NI bands where applicable) is
            calculated at payment from your postcode.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm"
      />
    </div>
  );
}

export function CheckoutShell() {
  return (
    <main>
      <SectionIntro
        eyebrow="Checkout"
        title="Secure checkout"
        description="GBP payments via Stripe. Personalisation details travel with your order."
      />
      <CheckoutClient />
    </main>
  );
}
