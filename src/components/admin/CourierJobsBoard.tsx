"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import {
  COURIER_JOB_STATUSES,
  formatStatus,
  labelCourierUrgency,
  labelCourierVertical,
} from "@/lib/bookings/labels";
import type {
  CourierJobStatus,
  CourierUrgency,
  CourierVertical,
} from "@/types/database";

type JobRow = {
  id: string;
  status: CourierJobStatus;
  vertical: CourierVertical;
  urgency: CourierUrgency;
  item_description: string;
  pickup_postcode: string;
  dropoff_postcode: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export default function CourierJobsBoard() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | CourierJobStatus>("all");

  useEffect(() => {
    fetch("/api/admin/courier-jobs")
      .then(async (res) => {
        const data = (await res.json()) as {
          jobs?: JobRow[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setJobs(data.jobs ?? []);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (tab === "all" ? jobs : jobs.filter((j) => j.status === tab)),
    [jobs, tab]
  );

  return (
    <div>
      <AdminPageHeader
        title="Courier Jobs"
        description="Medical, legal, flowers, general — pickup to delivered."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`px-3 py-1.5 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] ${
            tab === "all"
              ? "bg-vb-ink text-vb-paper"
              : "border border-vb-line text-vb-muted hover:border-vb-ink"
          }`}
        >
          All ({jobs.length})
        </button>
        {COURIER_JOB_STATUSES.map((s) => {
          const count = jobs.filter((j) => j.status === s).length;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setTab(s)}
              className={`px-3 py-1.5 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] ${
                tab === s
                  ? "bg-vb-ink text-vb-paper"
                  : "border border-vb-line text-vb-muted hover:border-vb-ink"
              }`}
            >
              {formatStatus(s)} ({count})
            </button>
          );
        })}
      </div>

      {loading && <AdminTableSkeleton rows={6} cols={5} />}
      {error && <AdminEmptyState title="Cannot load jobs" body={error} />}
      {!loading && !error && filtered.length === 0 && (
        <AdminEmptyState
          title="No courier jobs"
          body="Requests from /courier/book appear here."
        />
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto border border-vb-line bg-vb-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-vb-line bg-vb-mist font-heading text-[10px] uppercase tracking-[0.16em] text-vb-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Route</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr key={j.id} className="border-b border-vb-line last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/courier-jobs/${j.id}`}
                      className="font-heading text-xs font-semibold tracking-wide hover:text-vb-accent"
                    >
                      {j.pickup_postcode} → {j.dropoff_postcode}
                    </Link>
                    <span className="mt-0.5 block max-w-xs truncate text-xs text-vb-muted">
                      {j.item_description}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{j.full_name}</span>
                    <span className="text-xs text-vb-muted">{j.email}</span>
                  </td>
                  <td className="px-4 py-3 text-vb-muted">
                    {labelCourierVertical(j.vertical)}
                    <span className="mt-0.5 block text-xs">
                      {labelCourierUrgency(j.urgency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-vb-muted">
                    {formatStatus(j.status)}
                  </td>
                  <td className="px-4 py-3 text-vb-muted">
                    {new Date(j.created_at).toLocaleString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
