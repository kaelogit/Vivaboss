"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatGbp } from "@/lib/products/money";
import { cn } from "@/lib/utils";

type Tracked = {
  orderNumber: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  totalGbp: number;
  shippingGbp: number;
  fulfillmentMethod?: "delivery" | "collection";
  shipTo: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  items: {
    name: string;
    quantity: number;
    lineTotal: number;
    installation: boolean;
  }[];
};

type TimelineStep = {
  key: string;
  label: string;
  detail?: string | null;
  state: "done" | "current" | "upcoming";
};

function buildTimeline(order: Tracked): TimelineStep[] {
  const status = order.status;
  const cancelled = status === "cancelled" || status === "refunded";

  if (cancelled) {
    return [
      {
        key: "placed",
        label: "Order placed",
        detail: formatWhen(order.createdAt),
        state: "done",
      },
      {
        key: "end",
        label: status === "refunded" ? "Refunded" : "Cancelled",
        detail: null,
        state: "current",
      },
    ];
  }

  const paid =
    Boolean(order.paidAt) ||
    [
      "paid",
      "pre_order",
      "processing",
      "personalising",
      "shipped",
      "delivered",
    ].includes(status);

  const preparing = [
    "paid",
    "pre_order",
    "processing",
    "personalising",
  ].includes(status);

  const shipped = status === "shipped" || status === "delivered";
  const delivered = status === "delivered";

  const prepareLabel =
    status === "personalising"
      ? "Personalising"
      : status === "pre_order"
        ? "Pre-order in progress"
        : "Preparing";

  let prepareState: TimelineStep["state"] = "upcoming";
  if (shipped || delivered) prepareState = "done";
  else if (preparing || (paid && status !== "pending_payment"))
    prepareState = "current";

  let shipState: TimelineStep["state"] = "upcoming";
  if (delivered) shipState = "done";
  else if (status === "shipped") shipState = "current";

  const collect = order.fulfillmentMethod === "collection";

  return [
    {
      key: "placed",
      label: "Order placed",
      detail: formatWhen(order.createdAt),
      state: "done",
    },
    {
      key: "paid",
      label: "Payment received",
      detail: order.paidAt ? formatWhen(order.paidAt) : null,
      state: paid ? (preparing || shipped || delivered ? "done" : "current") : "upcoming",
    },
    {
      key: "prepare",
      label: prepareLabel,
      detail: null,
      state: prepareState,
    },
    {
      key: "shipped",
      label: collect ? "Ready for pick up" : "Shipped",
      detail: order.shippedAt ? formatWhen(order.shippedAt) : null,
      state: shipState,
    },
    {
      key: "delivered",
      label: collect ? "Picked up" : "Delivered",
      detail: null,
      state: delivered ? "done" : "upcoming",
    },
  ];
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderTimeline({ order }: { order: Tracked }) {
  const steps = buildTimeline(order);

  return (
    <ol className="relative mt-6 space-y-0" aria-label="Order progress">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[7px] top-4 bottom-0 w-px",
                  step.state === "done" ? "bg-vb-accent" : "bg-vb-line"
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-[1] mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2",
                step.state === "done" && "border-vb-accent bg-vb-accent",
                step.state === "current" &&
                  "border-vb-accent bg-vb-paper ring-2 ring-vb-accent/25",
                step.state === "upcoming" && "border-vb-line bg-vb-paper"
              )}
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  "font-heading text-[11px] font-semibold uppercase tracking-[0.14em]",
                  step.state === "upcoming" ? "text-vb-muted" : "text-vb-ink"
                )}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 text-xs text-vb-muted">{step.detail}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderTrackForm({
  initialOrderNumber = "",
  initialEmail = "",
}: {
  initialOrderNumber?: string;
  initialEmail?: string;
}) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Tracked | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch("/api/order/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = (await res.json()) as { order?: Tracked; error?: string };
      if (!res.ok || !data.order) {
        throw new Error(data.error ?? "Could not find order.");
      }
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={submit}
        className="space-y-4 border border-vb-line bg-vb-white p-5 sm:p-6"
      >
        <label className="block">
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
            Order number
          </span>
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="VB-…"
            className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
            Email
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
          />
        </label>
        {error && (
          <p className="border border-vb-danger/30 bg-vb-danger/5 px-4 py-3 text-sm text-vb-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center bg-vb-accent px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Looking up…
            </>
          ) : (
            "Track order"
          )}
        </button>
      </form>

      {order && (
        <div className="mt-6 border border-vb-line bg-vb-white p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-accent">
              {order.orderNumber}
            </p>
            <p className="text-sm text-vb-muted">
              {formatGbp(Number(order.totalGbp))}
            </p>
          </div>
          <h2 className="mt-2 font-heading text-xl font-bold uppercase tracking-tight text-vb-ink capitalize">
            {order.fulfillmentMethod === "collection" &&
            order.status === "shipped"
              ? "Ready for pick up"
              : order.fulfillmentMethod === "collection" &&
                  order.status === "delivered"
                ? "Picked up"
                : order.status.replace(/_/g, " ")}
          </h2>
          <p className="mt-1 text-sm text-vb-muted">
            {order.fulfillmentMethod === "collection"
              ? `Pick up from ${order.shipTo}`
              : `Ship to ${order.shipTo}`}
          </p>

          <OrderTimeline order={order} />

          {order.fulfillmentMethod !== "collection" &&
            (order.trackingNumber ||
              order.trackingCarrier ||
              order.trackingUrl) && (
            <div className="mt-2 border border-vb-line bg-vb-paper px-4 py-3 text-sm">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
                Parcel tracking
              </p>
              {order.trackingCarrier && (
                <p className="mt-1 text-vb-ink">{order.trackingCarrier}</p>
              )}
              {order.trackingNumber && (
                <p className="mt-0.5 font-mono text-vb-ink">
                  {order.trackingNumber}
                </p>
              )}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
                >
                  Track parcel →
                </a>
              )}
            </div>
          )}

          <ul className="mt-5 divide-y divide-vb-line border-y border-vb-line text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4 py-3">
                <span>
                  {item.name} × {item.quantity}
                  {item.installation ? (
                    <span className="block text-xs text-vb-accent">
                      Installation requested
                    </span>
                  ) : null}
                </span>
                <span>{formatGbp(Number(item.lineTotal))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-vb-muted">
              {order.fulfillmentMethod === "collection"
                ? "Click & pick up · Free"
                : `Delivery ${formatGbp(Number(order.shippingGbp))}`}
            </span>
            <span className="font-heading font-semibold">
              Total {formatGbp(Number(order.totalGbp))}
            </span>
          </div>
          <Link
            href="/contact"
            className="mt-5 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
          >
            Need help?
          </Link>
        </div>
      )}
    </div>
  );
}
