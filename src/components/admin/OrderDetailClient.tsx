"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StorageLink from "@/components/admin/StorageLink";
import { formatGbp } from "@/lib/products/money";
import type { OrderStatus } from "@/types/database";

type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  email: string;
  phone: string | null;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postcode: string;
  country: string;
  subtotal_gbp: number;
  shipping_gbp: number;
  total_gbp: number;
  notes: string | null;
  internal_notes: string | null;
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  created_at: string;
  inventory_applied?: boolean;
};

type Item = {
  id: string;
  product_name: string;
  product_slug: string | null;
  quantity: number;
  unit_price_gbp: number;
  line_total_gbp: number;
  image_url: string | null;
  customisation:
    | {
        label?: string;
        value?: string;
        file_url?: string;
        file_path?: string;
        field_type?: string;
      }[]
    | null;
  installation_requested: boolean;
  installation_price_gbp: number | null;
  is_preorder?: boolean;
};

type ServiceJobLink = {
  id: string;
  status: string;
  job_type: string;
  specific_service: string | null;
  created_at: string;
};

const STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "pre_order",
  "processing",
  "personalising",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [serviceJobs, setServiceJobs] = useState<ServiceJobLink[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<OrderStatus>("paid");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/orders/${orderId}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          order?: Order;
          items?: Item[];
          serviceJobs?: ServiceJobLink[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setOrder(data.order ?? null);
        setItems(data.items ?? []);
        setServiceJobs(data.serviceJobs ?? []);
        if (data.order) {
          setStatus(data.order.status);
          setNotes(data.order.internal_notes ?? "");
        }
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [orderId]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internal_notes: notes }),
      });
      const data = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setOrder(data.order ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-vb-muted">Loading order…</p>;
  }
  if (!order) {
    return (
      <p className="text-sm text-vb-danger">{error ?? "Order not found."}</p>
    );
  }

  const waDigits = (order.phone ?? "").replace(/\D/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        `Hi ${order.full_name}, regarding Vivaboss order ${order.order_number}: `
      )}`
    : null;

  return (
    <div>
      <AdminPageHeader
        title={order.order_number}
        description={`${order.full_name} · ${order.email}`}
      />

      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted hover:text-vb-accent"
        >
          ← All orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="border border-vb-line bg-vb-white p-5">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Line items
            </h2>
            <ul className="mt-4 divide-y divide-vb-line">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <div className="h-16 w-14 shrink-0 bg-vb-mist">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    {item.is_preorder && (
                      <p className="mt-0.5 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-vb-accent">
                        Pre-order
                      </p>
                    )}
                    <p className="text-xs text-vb-muted">
                      Qty {item.quantity} ·{" "}
                      {formatGbp(Number(item.unit_price_gbp))} each
                    </p>
                    {Array.isArray(item.customisation) &&
                      item.customisation.length > 0 && (
                        <ul className="mt-2 space-y-0.5 text-xs text-vb-muted">
                          {item.customisation.map((c, i) => {
                            const fileRef =
                              c.file_path ||
                              (c.field_type === "file" ? c.value : null) ||
                              c.file_url;
                            return (
                              <li key={i}>
                                {c.label}:{" "}
                                {c.field_type === "file" || c.file_path
                                  ? "upload"
                                  : c.value}
                                {fileRef ? (
                                  <>
                                    {" · "}
                                    <StorageLink
                                      pathOrUrl={fileRef}
                                      label="file"
                                    />
                                  </>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    {item.installation_requested && (
                      <p className="mt-1 text-xs text-vb-accent">
                        Installation
                        {item.installation_price_gbp != null
                          ? ` · ${formatGbp(Number(item.installation_price_gbp))}`
                          : " · quote"}
                      </p>
                    )}
                  </div>
                  <p className="font-heading text-sm font-semibold">
                    {formatGbp(Number(item.line_total_gbp))}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-vb-line pt-4 text-sm">
              <div className="flex justify-between text-vb-muted">
                <span>Subtotal</span>
                <span>{formatGbp(Number(order.subtotal_gbp))}</span>
              </div>
              <div className="flex justify-between text-vb-muted">
                <span>Shipping</span>
                <span>{formatGbp(Number(order.shipping_gbp))}</span>
              </div>
              <div className="flex justify-between font-heading font-semibold">
                <span>Total</span>
                <span>{formatGbp(Number(order.total_gbp))}</span>
              </div>
            </div>
          </section>

          {serviceJobs.length > 0 && (
            <section className="border border-vb-line bg-vb-white p-5">
              <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
                Linked install jobs
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {serviceJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/admin/service-jobs/${job.id}`}
                      className="font-medium text-vb-accent hover:underline"
                    >
                      {job.specific_service ?? job.job_type}
                    </Link>
                    <span className="ml-2 capitalize text-vb-muted">
                      {job.status.replace(/_/g, " ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {order.notes && (
            <section className="border border-vb-line bg-vb-white p-5">
              <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
                Customer notes
              </h2>
              <p className="mt-3 text-sm text-vb-ink">{order.notes}</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="border border-vb-line bg-vb-white p-5">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Customer
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>{order.full_name}</p>
              <a href={`mailto:${order.email}`} className="text-vb-accent">
                {order.email}
              </a>
              {order.phone && <p>{order.phone}</p>}
              <p className="pt-3 text-vb-muted">
                {order.address_line1}
                {order.address_line2 ? `, ${order.address_line2}` : ""}
                <br />
                {order.city} {order.postcode}
                <br />
                {order.country}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${order.email}?subject=${encodeURIComponent(
                  `Vivaboss order ${order.order_number}`
                )}`}
                className="inline-flex h-9 items-center border border-vb-line px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em]"
              >
                Email
              </a>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center border border-vb-line px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em]"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </section>

          <section className="border border-vb-line bg-vb-white p-5">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Ops
            </h2>
            <label className="mt-4 block">
              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-muted">
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-muted">
                Internal notes
              </span>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
              />
            </label>
            {error && <p className="mt-3 text-sm text-vb-danger">{error}</p>}
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="mt-4 inline-flex h-10 items-center bg-vb-ink px-4 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-paper disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
