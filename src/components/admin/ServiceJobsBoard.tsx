"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import {
  SERVICE_JOB_STATUSES,
  formatStatus,
  labelServiceType,
} from "@/lib/bookings/labels";
import type { ServiceJobStatus, ServiceJobType } from "@/types/database";

type JobRow = {
  id: string;
  status: ServiceJobStatus;
  job_type: ServiceJobType;
  specific_service: string | null;
  postcode: string;
  full_name: string;
  email: string;
  phone: string | null;
  preferred_window: string | null;
  created_at: string;
};

export default function ServiceJobsBoard() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | ServiceJobStatus>("all");

  useEffect(() => {
    fetch("/api/admin/service-jobs")
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
        title="Service Jobs"
        description="Home and smart-home bookings — status, email, WhatsApp."
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
        {SERVICE_JOB_STATUSES.map((s) => {
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
          title="No service jobs"
          body="Bookings from /services/book appear here."
        />
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto border border-vb-line bg-vb-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-vb-line bg-vb-mist font-heading text-[10px] uppercase tracking-[0.16em] text-vb-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Postcode</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr key={j.id} className="border-b border-vb-line last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/service-jobs/${j.id}`}
                      className="font-medium hover:text-vb-accent"
                    >
                      {labelServiceType(j.job_type)}
                    </Link>
                    {j.specific_service && (
                      <span className="mt-0.5 block text-xs text-vb-muted">
                        {j.specific_service}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{j.full_name}</span>
                    <span className="text-xs text-vb-muted">{j.email}</span>
                  </td>
                  <td className="px-4 py-3 font-heading text-xs font-semibold tracking-wide">
                    {j.postcode}
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
