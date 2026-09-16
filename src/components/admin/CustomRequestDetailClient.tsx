"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { AdminDetailSkeleton } from "@/components/admin/AdminSkeleton";
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
  const [emailingLink, setEmailingLink] = useState(false);
  const [emailingQuote, setEmailingQuote] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    setNotice(null);
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
        quoteEmailed?: boolean;
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
      if (data.quoteEmailed) {
        setNotice(
          `Quote emailed to ${data.request?.email ?? "the customer"}.`
        );
      } else if (status === "quoted" && quote_amount_gbp && quote_amount_gbp > 0) {
        setNotice(
          "Saved, but the quote email did not send. Check RESEND_API_KEY."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const emailQuote = async () => {
    setEmailingQuote(true);
    setError(null);
    setNotice(null);
    try {
      // Persist amount/message first if edited
      const amountTrim = quoteAmount.trim();
      const quote_amount_gbp =
        amountTrim === "" ? null : Number(amountTrim);
      if (
        amountTrim !== "" &&
        (!Number.isFinite(quote_amount_gbp) || quote_amount_gbp! < 0)
      ) {
        throw new Error("Enter a valid quote amount.");
      }
      if (quote_amount_gbp == null || quote_amount_gbp <= 0) {
        throw new Error("Set a quote amount before emailing.");
      }

      const patchRes = await fetch(`/api/admin/custom-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status === "new" || status === "reviewing" ? "quoted" : status,
          quote_amount_gbp,
          quote_message: quoteMessage,
          send_quote_email: true,
        }),
      });
      const data = (await patchRes.json()) as {
        request?: CustomRequest;
        quoteEmailed?: boolean;
        error?: string;
      };
      if (!patchRes.ok) throw new Error(data.error ?? "Could not email quote.");
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
      if (data.quoteEmailed) {
        setNotice(`Quote emailed to ${data.request?.email ?? "the customer"}.`);
      } else {
        throw new Error(
          "Could not send quote email. Check RESEND_API_KEY."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not email quote.");
    } finally {
      setEmailingQuote(false);
    }
  };

  const convertToPay = async () => {
    setConverting(true);
    setError(null);
    setNotice(null);
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
        emailed?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Convert failed.");
      setRequest(data.request ?? null);
      if (data.request) {
        setStatus(data.request.status);
      }
      if (data.emailed) {
        setNotice(
          `Pay link emailed to the customer${
            data.request?.email ? ` (${data.request.email})` : ""
          }.`
        );
      } else if (data.checkoutUrl) {
        setNotice(
          "Checkout created, but the pay-link email did not send. Copy the link below and share it manually (check RESEND_API_KEY)."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Convert failed.");
    } finally {
      setConverting(false);
    }
  };

  const resendPayLink = async () => {
    setEmailingLink(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/custom-requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "email_pay_link" }),
      });
      const data = (await res.json()) as {
        emailed?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not email pay link.");
      setNotice(
        `Pay link re-sent to ${request?.email ?? "the customer"}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not email pay link.");
    } finally {
      setEmailingLink(false);
    }
  };

  const copyCheckoutLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy — select the link manually.");
    }
  };

  if (loading) {
    return <AdminDetailSkeleton />;
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
            {notice && (
              <p className="mt-2 border border-vb-accent/30 bg-vb-accent-soft px-3 py-2 text-sm text-vb-ink">
                {notice}
              </p>
            )}

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

            <button
              type="button"
              disabled={
                emailingQuote ||
                !quoteAmount.trim() ||
                Number(quoteAmount) <= 0
              }
              onClick={() => void emailQuote()}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 border border-vb-accent bg-vb-accent/10 px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent hover:bg-vb-accent hover:text-white disabled:opacity-50"
            >
              {emailingQuote ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              Email quote to customer
            </button>

            <p className="mt-2 text-xs text-vb-muted">
              Quote email is the amount + your note (no Stripe button yet). Then
              use Create &amp; email pay link so they get a checkout URL —
              Stripe does not open in your browser.
            </p>

            <button
              type="button"
              disabled={converting || !canConvert}
              onClick={convertToPay}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 border border-vb-ink bg-vb-paper px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-vb-ink hover:text-vb-paper disabled:opacity-50"
            >
              {converting ? <Loader2 size={14} className="animate-spin" /> : null}
              Create &amp; email pay link
            </button>

            {meta.checkoutUrl && (
              <button
                type="button"
                disabled={emailingLink}
                onClick={resendPayLink}
                className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 border border-vb-line px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-ink hover:border-vb-ink disabled:opacity-50"
              >
                {emailingLink ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Resend pay link email
              </button>
            )}

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
              <div className="mt-4 space-y-2 border-t border-vb-line pt-4">
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
                  Customer pay link
                </p>
                <p className="break-all text-xs text-vb-ink">{meta.checkoutUrl}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyCheckoutLink(meta.checkoutUrl!)}
                    className="inline-flex h-9 items-center bg-vb-mist px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-ink hover:bg-vb-line"
                  >
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  {waHref && (
                    <a
                      href={`https://wa.me/${waDigits}?text=${encodeURIComponent(
                        `Hi ${request.full_name}, here’s your secure Vivaboss pay link${
                          request.quote_amount_gbp != null
                            ? ` (${formatGbp(Number(request.quote_amount_gbp))})`
                            : ""
                        }: ${meta.checkoutUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center border border-vb-line px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-ink hover:border-vb-ink"
                    >
                      WhatsApp link
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
