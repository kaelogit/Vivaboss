"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StorageLink from "@/components/admin/StorageLink";
import {
  COURIER_JOB_STATUSES,
  formatStatus,
  labelCourierUrgency,
  labelCourierVertical,
} from "@/lib/bookings/labels";
import type { CourierJob, CourierJobStatus } from "@/types/database";

export default function CourierJobDetailClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<CourierJob | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<CourierJobStatus>("new");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/courier-jobs/${jobId}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          job?: CourierJob;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setJob(data.job ?? null);
        if (data.job) {
          setStatus(data.job.status);
          setNotes(data.job.internal_notes ?? "");
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
      const res = await fetch(`/api/admin/courier-jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internal_notes: notes }),
      });
      const data = (await res.json()) as { job?: CourierJob; error?: string };
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
        `Hi ${job.full_name}, regarding your Vivaboss courier (${job.pickup_postcode} → ${job.dropoff_postcode}): `
      )}`
    : null;

  return (
    <div>
      <AdminPageHeader
        title={`${job.pickup_postcode} → ${job.dropoff_postcode}`}
        description={`${labelCourierVertical(job.vertical)} · ${labelCourierUrgency(job.urgency)}`}
      />

      <div className="mb-6">
        <Link
          href="/admin/courier-jobs"
          className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted hover:text-vb-accent"
        >
          ← All courier jobs
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="border border-vb-line bg-vb-white p-5">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Delivery
            </h2>
            <p className="mt-4 text-sm whitespace-pre-wrap">
              {job.item_description}
            </p>
            {job.notes && (
              <p className="mt-3 text-sm text-vb-muted whitespace-pre-wrap">
                {job.notes}
              </p>
            )}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 text-sm">
              <div>
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-muted">
                  Pickup
                </p>
                <p className="mt-2">
                  {job.pickup_line1}
                  {job.pickup_line2 ? `, ${job.pickup_line2}` : ""}
                  <br />
                  {[job.pickup_city, job.pickup_postcode]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>
              <div>
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-muted">
                  Drop-off
                </p>
                <p className="mt-2">
                  {job.dropoff_line1}
                  {job.dropoff_line2 ? `, ${job.dropoff_line2}` : ""}
                  <br />
                  {[job.dropoff_city, job.dropoff_postcode]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>
            </div>
            {job.preferred_window && (
              <p className="mt-4 text-sm text-vb-muted">
                Window: {job.preferred_window}
              </p>
            )}
            {job.photos?.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {job.photos.map((path) => (
                  <li key={path} className="h-20 w-20 overflow-hidden bg-vb-mist">
                    <StorageLink pathOrUrl={path} asImage className="block h-20 w-20" />
                  </li>
                ))}
              </ul>
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
                  `Your Vivaboss courier (${job.pickup_postcode} → ${job.dropoff_postcode})`
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
                onChange={(e) => setStatus(e.target.value as CourierJobStatus)}
                className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
              >
                {COURIER_JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {formatStatus(s)}
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
