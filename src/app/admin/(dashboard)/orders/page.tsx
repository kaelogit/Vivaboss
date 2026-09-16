"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import { formatGbp } from "@/lib/products/money";
import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  email: string;
  full_name: string;
  total_gbp: number;
  created_at: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(async (res) => {
        const data = (await res.json()) as {
          orders?: OrderRow[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setOrders(data.orders ?? []);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Stripe checkouts with personalisation — open any row for fulfilment."
      />
      {loading && <AdminTableSkeleton rows={6} cols={5} />}
      {error && <AdminEmptyState title="Cannot load orders" body={error} />}
      {!loading && !error && orders.length === 0 && (
        <AdminEmptyState
          title="No orders yet"
          body="Orders appear after Stripe checkout. Run the orders migration first."
        />
      )}
      {!loading && !error && orders.length > 0 && (
        <div className="overflow-x-auto border border-vb-line bg-vb-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-vb-line bg-vb-mist font-heading text-[10px] uppercase tracking-[0.16em] text-vb-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-vb-line last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium hover:text-vb-accent"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{o.full_name}</span>
                    <span className="text-xs text-vb-muted">{o.email}</span>
                  </td>
                  <td className="px-4 py-3">{formatGbp(o.total_gbp)}</td>
                  <td className="px-4 py-3 capitalize text-vb-muted">
                    {o.status.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-vb-muted">
                    {new Date(o.created_at).toLocaleString("en-GB")}
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
