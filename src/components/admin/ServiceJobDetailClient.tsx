"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StorageLink from "@/components/admin/StorageLink";
import {
  SERVICE_JOB_STATUSES,
  formatStatus,
  labelServiceType,
} from "@/lib/bookings/labels";
import type { ServiceJob, ServiceJobStatus } from "@/types/database";

export default function ServiceJobDetailClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<ServiceJob | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ServiceJobStatus>("new");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/service-jobs/${jobId}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          job?: ServiceJob;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setJob(data.job ?? null);
        if (data.job) {
          setStatus(data.job.status);
          setNotes(data.job.internal_notes ?? "");
          setScheduledAt(
            data.job.scheduled_at
              ? data.job.scheduled_at.slice(0, 16)
              : ""
          );
        }
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [jobId]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/service-jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          internal_notes: notes,
          scheduled_at: scheduledAt
            ? new Date(scheduledAt).toISOString()
            : null,
        }),
      });
      const data = (await res.json()) as { job?: ServiceJob; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setJob(data.job ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-vb-muted">Loading job…</p>;
  }
  if (!job) {
    return (
      <p className="text-sm text-vb-danger">{error ?? "Job not found."}</p>
    );
  }

  const waDigits = (job.whatsapp || job.phone || "").replace(/\D/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        `Hi ${job.full_name}, regarding your Vivaboss service booking (${job.postcode}): `
      )}`
    : null;

  return (
    <div>
      <AdminPageHeader
        title={labelServiceType(job.job_type)}
        description={`${job.full_name} · ${job.postcode}`}
      />

      <div className="mb-6">
        <Link
          href="/admin/service-jobs"
          className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted hover:text-vb-accent"
        >
          ← All service jobs
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="border border-vb-line bg-vb-white p-5">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Job details
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {job.specific_service && (
                <div>
                  <dt className="text-vb-muted">Specific</dt>
                  <dd>{job.specific_service}</dd>
                </div>
              )}
              <div>
                <dt className="text-vb-muted">Description</dt>
                <dd className="whitespace-pre-wrap">
                  {job.description || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-vb-muted">Preferred window</dt>
                <dd>{job.preferred_window || "—"}</dd>
              </div>
              <div>
                <dt className="text-vb-muted">Address</dt>
                <dd>
                  {[job.address_line1, job.address_line2, job.city, job.postcode]
                    .filter(Boolean)
                    .join(", ") || job.postcode}
                </dd>
              </div>
              <div>
                <dt className="text-vb-muted">Source</dt>
                <dd className="capitalize">{job.source.replace(/_/g, " ")}</dd>
              </div>
              {job.related_order_id && (
                <div>
                  <dt className="text-vb-muted">Related order</dt>
                  <dd>
                    <Link
                      href={`/admin/orders/${job.related_order_id}`}
                      className="text-vb-accent hover:underline"
                    >
                      Open order →
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
            {job.photos?.length > 0 && (
              <div className="mt-5">
                <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
                  Photos
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {job.photos.map((path) => (
                    <li key={path} className="h-20 w-20 overflow-hidden bg-vb-mist">
                      <StorageLink pathOrUrl={path} asImage className="block h-20 w-20" />
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
              <p>{job.full_name}</p>
              <a href={`mailto:${job.email}`} className="text-vb-accent">
                {job.email}
              </a>
              {job.phone && <p>{job.phone}</p>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${job.email}?subject=${encodeURIComponent(
                  `Your Vivaboss service booking (${job.postcode})`
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
                  className="inline-flex h-9 items-center border border-vb-line px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] hover:border-vb-ink"
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
                onChange={(e) => setStatus(e.target.value as ServiceJobStatus)}
                className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
              >
                {SERVICE_JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {formatStatus(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-muted">
                Scheduled
              </span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
              />
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
            {error && (
              <p className="mt-3 text-sm text-vb-danger">{error}</p>
            )}
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
