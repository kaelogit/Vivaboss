"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatGbp } from "@/lib/products/money";

type Tracked = {
  orderNumber: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  totalGbp: number;
  shippingGbp: number;
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

export default function OrderTrackForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
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
        className="space-y-5 border border-vb-line bg-vb-white p-6 sm:p-8"
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
            Email used at checkout
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
        <div className="mt-8 border border-vb-line bg-vb-white p-6 sm:p-8">
          <p className="vb-eyebrow text-vb-accent">{order.orderNumber}</p>
          <h2 className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight capitalize">
            {order.status.replace(/_/g, " ")}
          </h2>
          <p className="mt-2 text-sm text-vb-muted">
            Placed {new Date(order.createdAt).toLocaleString("en-GB")}
            {order.paidAt
              ? ` · Paid ${new Date(order.paidAt).toLocaleString("en-GB")}`
              : ""}
          </p>
          <p className="mt-1 text-sm text-vb-muted">Ship to {order.shipTo}</p>
          {(order.trackingNumber ||
            order.trackingCarrier ||
            order.trackingUrl) && (
            <div className="mt-4 border border-vb-line bg-vb-paper px-4 py-3 text-sm">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
                Tracking
              </p>
              {order.trackingCarrier && (
                <p className="mt-1 text-vb-ink">{order.trackingCarrier}</p>
              )}
              {order.trackingNumber && (
                <p className="mt-0.5 font-mono text-vb-ink">
                  {order.trackingNumber}
                </p>
              )}
              {order.shippedAt && (
                <p className="mt-1 text-xs text-vb-muted">
                  Shipped {new Date(order.shippedAt).toLocaleString("en-GB")}
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
          <ul className="mt-6 divide-y divide-vb-line border-y border-vb-line text-sm">
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
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-vb-muted">
              Shipping {formatGbp(Number(order.shippingGbp))}
            </span>
            <span className="font-heading font-semibold">
              Total {formatGbp(Number(order.totalGbp))}
            </span>
          </div>
          <Link
            href="/contact"
            className="mt-6 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent"
          >
            Need help? Contact us →
          </Link>
        </div>
      )}
    </div>
  );
}
