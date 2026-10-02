"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock, MapPin, RotateCcw, Truck } from "lucide-react";
import SectionIntro from "@/components/store/SectionIntro";
import { formatGbp } from "@/lib/products/money";
import { lineTotal } from "@/lib/cart/types";
import { PREORDER_LEAD } from "@/lib/products/stock";
import { useCartStore } from "@/store/cart";
import { isValidUkPostcode } from "@/lib/uk/postcode";
import {
  useShippingQuote,
  type FulfillmentMethod,
} from "@/components/shop/useShippingQuote";
import { cn } from "@/lib/utils";

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
  const [fulfillment, setFulfillment] =
    useState<FulfillmentMethod>("delivery");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [notes, setNotes] = useState("");

  const quote = useShippingQuote(subtotal, postcode, fulfillment);
  // Default on until quote loads — matches site settings default (avoids toggle flash).
  const collectionEnabled = quote?.collectionEnabled ?? true;
  const method =
    fulfillment === "collection" && collectionEnabled
      ? "collection"
      : "delivery";
  const postcodeReady = isValidUkPostcode(postcode);
  const shipping = quote?.shippingGbp ?? null;
  const total = quote?.totalGbp ?? null;

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (quote && !quote.collectionEnabled && fulfillment === "collection") {
      setFulfillment("delivery");
    }
  }, [quote, fulfillment]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "delivery" && !isValidUkPostcode(postcode)) {
      setError("Enter a valid UK postcode.");
      return;
    }
    if (method === "collection" && !phone.trim()) {
      setError("A phone number helps us reach you for collection.");
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
          addressLine1: method === "delivery" ? addressLine1 : undefined,
          addressLine2: method === "delivery" ? addressLine2 : undefined,
          city: method === "delivery" ? city : undefined,
          postcode: method === "delivery" ? postcode : undefined,
          notes,
          fulfillmentMethod: method,
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
    <div className="vb-container py-8 sm:py-10">
      {cancelled && (
        <p className="mb-6 border border-vb-line bg-vb-mist px-4 py-3 text-sm text-vb-muted">
          Checkout cancelled — your bag is still here.
        </p>
      )}

      <form
        onSubmit={submit}
        className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-4 border border-vb-line bg-vb-white p-6 sm:p-8">
          {collectionEnabled && (
            <div>
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
                How do you want it?
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "delivery" as const, label: "Delivery", icon: Truck },
                    {
                      id: "collection" as const,
                      label: "Click & collect",
                      icon: MapPin,
                    },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  const active = fulfillment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFulfillment(opt.id)}
                      className={cn(
                        "flex items-center justify-center gap-2 border px-3 py-3 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                        active
                          ? "border-vb-ink bg-vb-ink text-vb-paper"
                          : "border-vb-line bg-vb-paper text-vb-ink hover:border-vb-ink"
                      )}
                    >
                      <Icon size={14} strokeWidth={1.75} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
            {method === "collection" ? "Your details" : "Delivery details"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name *"
              value={fullName}
              onChange={setFullName}
              required
            />
            <Field
              label="Email *"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              label={method === "collection" ? "Phone *" : "Phone"}
              type="tel"
              value={phone}
              onChange={setPhone}
              required={method === "collection"}
            />
            {method === "delivery" ? (
              <>
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
              </>
            ) : (
              <div className="sm:col-span-2 border border-vb-line bg-vb-mist/50 px-4 py-3 text-sm text-vb-ink">
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-muted">
                  Collect from
                </p>
                <p className="mt-1.5">
                  {quote?.collectionLabel ?? "Vivaboss Fusion"}
                </p>
                <p className="mt-2 text-xs text-vb-muted">
                  Free pickup. We’ll email you when your order is ready.
                </p>
              </div>
            )}
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
            className="inline-flex h-12 w-full items-center justify-center gap-2 bg-vb-accent font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            {total == null ? "Continue to payment" : `Pay ${formatGbp(total)}`}
          </button>
          <p className="text-xs text-vb-muted">
            Secure payment. Your bag is saved if you return.
          </p>
        </div>

        <aside className="h-fit border border-vb-line bg-vb-paper p-6 lg:sticky lg:top-24">
          <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
            Order summary
          </h2>
          {hasPreorder && (
            <p className="mt-3 text-xs text-vb-muted">
              Includes pre-order items — typically {PREORDER_LEAD} after payment.
            </p>
          )}
          <ul className="mt-5 divide-y divide-vb-line border-y border-vb-line">
            {lines.map((line) => {
              const onSale =
                line.compareAtGbp != null &&
                line.compareAtGbp > line.unitPriceGbp;
              return (
                <li key={line.id} className="flex gap-3 py-4">
                  <div className="relative h-16 w-14 shrink-0">
                    <div className="relative h-full w-full overflow-hidden bg-vb-mist">
                      {line.image ? (
                        <Image
                          src={line.image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <span className="absolute -right-1.5 -top-1.5 z-10 flex h-5 min-w-5 items-center justify-center bg-vb-ink px-1 font-heading text-[10px] font-bold text-vb-paper">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-xs font-bold uppercase tracking-wide text-vb-ink">
                      {line.name}
                    </p>
                    {line.isPreorder && (
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-vb-accent">
                        Pre-order
                      </p>
                    )}
                    {line.customisation.length > 0 && (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-vb-muted">
                        {line.customisation
                          .map((c) => `${c.label}: ${c.value}`)
                          .join(" · ")}
                      </p>
                    )}
                    {line.installationRequested && (
                      <p className="mt-1 text-[11px] text-vb-accent">
                        Installation
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    {onSale && line.compareAtGbp != null && (
                      <p className="text-[11px] text-vb-muted line-through">
                        {formatGbp(line.compareAtGbp * line.quantity)}
                      </p>
                    )}
                    <p className={onSale ? "text-vb-accent" : "text-vb-ink"}>
                      {formatGbp(lineTotal(line))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-vb-muted">
              <span>Subtotal</span>
              <span>{formatGbp(subtotal)}</span>
            </div>
            <div className="flex justify-between text-vb-muted">
              <span>
                {method === "collection"
                  ? "Click & collect"
                  : shipping === 0
                    ? "Shipping"
                    : quote?.bandLabel
                      ? `Shipping · ${quote.bandLabel}`
                      : "Shipping · UK standard"}
              </span>
              <span>
                {shipping == null
                  ? "…"
                  : shipping === 0
                    ? "Free"
                    : formatGbp(shipping)}
              </span>
            </div>
            <div className="flex justify-between border-t border-vb-line pt-3 font-heading text-base font-bold text-vb-ink">
              <span>Total</span>
              <span>{total == null ? "…" : formatGbp(total)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-vb-muted">
            {method === "collection"
              ? "No shipping charge for pickup."
              : postcodeReady
                ? "Includes UK delivery."
                : "Enter your postcode for Highlands, Islands, or Northern Ireland."}
          </p>
          <ul className="mt-5 space-y-2.5 border-t border-vb-line pt-4 text-xs text-vb-muted">
            <li className="flex items-center gap-2">
              <Lock size={14} className="shrink-0 text-vb-accent" aria-hidden />
              Secure card payment
            </li>
            <li className="flex items-center gap-2">
              {method === "collection" ? (
                <MapPin
                  size={14}
                  className="shrink-0 text-vb-accent"
                  aria-hidden
                />
              ) : (
                <Truck
                  size={14}
                  className="shrink-0 text-vb-accent"
                  aria-hidden
                />
              )}
              {method === "collection"
                ? "Collect when we email you"
                : "UK delivery with tracking"}
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw
                size={14}
                className="shrink-0 text-vb-accent"
                aria-hidden
              />
              <Link
                href="/returns"
                className="underline-offset-2 hover:underline"
              >
                Returns & refunds
              </Link>
            </li>
          </ul>
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
      <SectionIntro compact title="Checkout" />
      <CheckoutClient />
    </main>
  );
}
