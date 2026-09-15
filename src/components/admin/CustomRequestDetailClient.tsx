"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StorageLink from "@/components/admin/StorageLink";
import { formatGbp } from "@/lib/products/money";
import type { CustomRequest, CustomRequestStatus, Json } from "@/types/database";

const STATUSES: CustomRequestStatus[] = [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "converted_to_order",
];

function snapshotMeta(snapshot: Json): {
  orderId?: string;
  orderNumber?: string;
  checkoutUrl?: string;
  stripeSessionId?: string;
} {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return {};
  }
  const s = snapshot as Record<string, unknown>;
  return {
    orderId: typeof s.order_id === "string" ? s.order_id : undefined,
    orderNumber:
      typeof s.order_number === "string" ? s.order_number : undefined,
    checkoutUrl: typeof s.checkout_url === "string" ? s.checkout_url : undefined,
    stripeSessionId:
      typeof s.stripe_checkout_session_id === "string"
        ? s.stripe_checkout_session_id
        : undefined,
  };
}

export default function CustomRequestDetailClient({
  requestId,
}: {
  requestId: string;
}) {
  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [status, setStatus] = useState<CustomRequestStatus>("new");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/custom-requests/${requestId}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          request?: CustomRequest;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setRequest(data.request ?? null);
        if (data.request) {
          setStatus(data.request.status);
          setQuoteAmount(
            data.request.quote_amount_gbp != null
              ? String(data.request.quote_amount_gbp)
              : ""
          );
          setQuoteMessage(data.request.quote_message ?? "");
        }
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [requestId]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const amountTrim = quoteAmount.trim();
      const quote_amount_gbp =
        amountTrim === ""
          ? null
          : Number(amountTrim);

      if (amountTrim !== "" && (!Number.isFinite(quote_amount_gbp) || quote_amount_gbp! < 0)) {
        throw new Error("Enter a valid quote amount.");
      }

      const res = await fetch(`/api/admin/custom-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          quote_amount_gbp,
          quote_message: quoteMessage,
        }),
      });
      const data = (await res.json()) as {
        request?: CustomRequest;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setRequest(data.request ?? null);
      if (data.request) {
        setStatus(data.request.status);
        setQuoteAmount(
          data.request.quote_amount_gbp != null
            ? String(data.request.quote_amount_gbp)
            : ""
        );
        setQuoteMessage(data.request.quote_message ?? "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const convertToPay = async () => {
    setConverting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/custom-requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert" }),
      });
      const data = (await res.json()) as {
        request?: CustomRequest;
        checkoutUrl?: string;
        orderId?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Convert failed.");
      setRequest(data.request ?? null);
      if (data.request) {
        setStatus(data.request.status);
      }
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Convert failed.");
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-vb-muted">Loading request…</p>;
  }
  if (!request) {
    return (
      <p className="text-sm text-vb-danger">{error ?? "Request not found."}</p>
    );
  }

  const waSource = request.whatsapp || request.phone || "";
  const waDigits = waSource.replace(/\D/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        `Hi ${request.full_name}, regarding your Vivaboss custom request${
          request.product_name ? ` for ${request.product_name}` : ""
        }: `
      )}`
    : null;

  const meta = snapshotMeta(request.field_snapshot);
  const canConvert =
    request.status !== "converted_to_order" &&
    request.quote_amount_gbp != null &&
    Number(request.quote_amount_gbp) > 0;

  const fieldEntries =
    request.field_snapshot &&
    typeof request.field_snapshot === "object" &&
    !Array.isArray(request.field_snapshot)
      ? Object.entries(request.field_snapshot as Record<string, unknown>).filter(
          ([key]) =>
            ![
              "order_id",
              "order_number",
              "stripe_checkout_session_id",
              "checkout_url",
            ].includes(key)
        )
      : [];

  return (
    <div>
      <AdminPageHeader
        title={request.product_name ?? "Custom request"}
        description={`${request.full_name} · ${request.email}`}
      />

      <div className="mb-6">
        <Link
          href="/admin/custom-requests"
          className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted hover:text-vb-accent"
        >
          ← All custom requests
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="border border-vb-line bg-vb-white p-5">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Request details
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-vb-muted">Product</dt>
                <dd>{request.product_name ?? "—"}</dd>
              </div>
              {request.preferred_material && (
                <div>
                  <dt className="text-vb-muted">Preferred material</dt>
                  <dd>{request.preferred_material}</dd>
                </div>
              )}
              <div>
                <dt className="text-vb-muted">Message</dt>
                <dd className="whitespace-pre-wrap">
                  {request.message || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-vb-muted">Instructions</dt>
                <dd className="whitespace-pre-wrap">
                  {request.instructions || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-vb-muted">Submitted</dt>
                <dd>
                  {new Date(request.created_at).toLocaleString("en-GB")}
                </dd>
              </div>
            </dl>

            {fieldEntries.length > 0 && (
              <div className="mt-5 border-t border-vb-line pt-4">
                <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
                  Field snapshot
                </p>
                <ul className="mt-3 space-y-1 text-sm text-vb-muted">
                  {fieldEntries.map(([key, value]) => (
                    <li key={key}>
                      <span className="text-vb-ink">{key}</span>:{" "}
                      {typeof value === "string" || typeof value === "number"
                        ? String(value)
                        : JSON.stringify(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {request.uploads?.length > 0 && (
              <div className="mt-5 border-t border-vb-line pt-4">
                <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
                  Uploads
                </p>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {request.uploads.map((path, i) => (
                    <li key={`${path}-${i}`}>
                      <div className="h-20 w-20 overflow-hidden bg-vb-mist">
                        <StorageLink
                          pathOrUrl={path}
                          asImage
                          label={`Upload ${i + 1}`}
                          className="block h-full w-full"
                        />
                      </div>
                      <StorageLink
                        pathOrUrl={path}
                        label={`File ${i + 1}`}
                        className="mt-1 block text-xs text-vb-accent"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-vb-line bg-vb-white p-5">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Customer
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>{request.full_name}</p>
              <a href={`mailto:${request.email}`} className="text-vb-accent">
                {request.email}
              </a>
              {request.phone && <p>{request.phone}</p>}
              {request.whatsapp && request.whatsapp !== request.phone && (
                <p className="text-vb-muted">WhatsApp: {request.whatsapp}</p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${request.email}?subject=${encodeURIComponent(
                  `Your Vivaboss custom request${
                    request.product_name ? ` — ${request.product_name}` : ""
                  }`
                )}`}
                className="inline-flex h-9 items-center border border-vb-line px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] hover:border-vb-ink"
              >
                Email
              </a>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center bg-vb-accent px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </section>

          <section className="border border-vb-line bg-vb-white p-5">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Quote & status
            </h2>
            <label className="mt-4 block font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Status
            </label>
            <select
              className="mt-1.5 h-10 w-full border border-vb-line bg-vb-paper px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomRequestStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            <label className="mt-4 block font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Quote amount (GBP)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1.5 h-10 w-full border border-vb-line bg-vb-paper px-3 text-sm"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              placeholder="0.00"
            />

            <label className="mt-4 block font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Quote message
            </label>
            <textarea
              className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
              rows={4}
              value={quoteMessage}
              onChange={(e) => setQuoteMessage(e.target.value)}
              placeholder="Shown to the customer in the quote email"
            />

            {error && <p className="mt-2 text-sm text-vb-danger">{error}</p>}

            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="mt-4 inline-flex h-10 items-center gap-2 bg-vb-ink px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-paper hover:bg-vb-accent disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Save
              {status === "quoted" ? " & send quote" : ""}
            </button>

            <p className="mt-2 text-xs text-vb-muted">
              Saving with status &quot;quoted&quot; emails the customer and admin.
            </p>

            <button
              type="button"
              disabled={converting || !canConvert}
              onClick={convertToPay}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 border border-vb-ink bg-vb-paper px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-vb-ink hover:text-vb-paper disabled:opacity-50"
            >
              {converting ? <Loader2 size={14} className="animate-spin" /> : null}
              Convert to pay
            </button>

            {request.quote_amount_gbp != null && (
              <p className="mt-3 text-xs text-vb-muted">
                Quote {formatGbp(Number(request.quote_amount_gbp))}
                {meta.orderNumber ? ` · Order ${meta.orderNumber}` : ""}
                {meta.stripeSessionId
                  ? ` · Stripe ${meta.stripeSessionId.slice(0, 12)}…`
                  : ""}
              </p>
            )}

            {meta.orderId && (
              <Link
                href={`/admin/orders/${meta.orderId}`}
                className="mt-2 inline-block font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
              >
                Open order →
              </Link>
            )}

            {meta.checkoutUrl && (
              <a
                href={meta.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted hover:text-vb-accent"
              >
                Open checkout link
              </a>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
