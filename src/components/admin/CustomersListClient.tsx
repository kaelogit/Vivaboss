"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import type { CustomerSummary } from "@/lib/admin/customers";

export default function CustomersListClient() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then(async (res) => {
        const data = (await res.json()) as {
          customers?: CustomerSummary[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setCustomers(data.customers ?? []);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="Unique emails aggregated from orders, custom requests, service jobs, and courier jobs."
      />
      {loading && <p className="text-sm text-vb-muted">Loading…</p>}
      {error && <AdminEmptyState title="Cannot load customers" body={error} />}
      {!loading && !error && customers.length === 0 && (
        <AdminEmptyState
          title="No customers yet"
          body="Customers appear when someone places an order or submits a booking / request."
        />
      )}
      {!loading && !error && customers.length > 0 && (
        <div className="overflow-x-auto border border-vb-line bg-vb-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-vb-line bg-vb-mist font-heading text-[10px] uppercase tracking-[0.16em] text-vb-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Requests</th>
                <th className="px-4 py-3 font-semibold">Services</th>
                <th className="px-4 py-3 font-semibold">Courier</th>
                <th className="px-4 py-3 font-semibold">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} className="border-b border-vb-line last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${encodeURIComponent(c.email)}`}
                      className="font-medium hover:text-vb-accent"
                    >
                      {c.name ?? c.email}
                    </Link>
                    {c.name && (
                      <span className="mt-0.5 block text-xs text-vb-muted">
                        {c.email}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-vb-muted">{c.orderCount}</td>
                  <td className="px-4 py-3 text-vb-muted">
                    {c.customRequestCount}
                  </td>
                  <td className="px-4 py-3 text-vb-muted">
                    {c.serviceJobCount}
                  </td>
                  <td className="px-4 py-3 text-vb-muted">
                    {c.courierJobCount}
                  </td>
                  <td className="px-4 py-3 text-vb-muted">
                    {c.lastActivityAt
                      ? new Date(c.lastActivityAt).toLocaleString("en-GB")
                      : "—"}
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
