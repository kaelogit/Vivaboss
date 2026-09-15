"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import { formatGbp } from "@/lib/products/money";

type RequestRow = {
  id: string;
  status: string;
  product_name: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  quote_amount_gbp?: number | null;
};

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/custom-requests")
      .then(async (res) => {
        const data = (await res.json()) as {
          requests?: RequestRow[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setRequests(data.requests ?? []);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Custom Requests"
        description="Quote and convert approval-required personalisation requests."
      />
      {loading && <p className="text-sm text-vb-muted">Loading…</p>}
      {error && <AdminEmptyState title="Cannot load requests" body={error} />}
      {!loading && !error && requests.length === 0 && (
        <AdminEmptyState
          title="No custom requests"
          body="Requests from portrait / approval products appear here."
        />
      )}
      {!loading && !error && requests.length > 0 && (
        <div className="overflow-x-auto border border-vb-line bg-vb-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-vb-line bg-vb-mist font-heading text-[10px] uppercase tracking-[0.16em] text-vb-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Quote</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-vb-line last:border-0 hover:bg-vb-mist/40"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/custom-requests/${r.id}`}
                      className="hover:text-vb-accent"
                    >
                      {r.product_name ?? "Custom"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/custom-requests/${r.id}`}
                      className="block hover:text-vb-accent"
                    >
                      <span className="block">{r.full_name}</span>
                      <span className="text-xs text-vb-muted">{r.email}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-vb-muted">
                    {r.status.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-vb-muted">
                    {r.quote_amount_gbp != null
                      ? formatGbp(Number(r.quote_amount_gbp))
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-vb-muted">
                    {new Date(r.created_at).toLocaleString("en-GB")}
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
