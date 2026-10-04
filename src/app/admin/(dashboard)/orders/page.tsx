"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import { formatGbp } from "@/lib/products/money";
import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { cn } from "@/lib/utils";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  email: string;
  full_name: string;
  total_gbp: number;
  created_at: string;
  fulfillment_method?: "delivery" | "collection" | null;
};

function statusMeta(
  status: string,
  fulfillment?: OrderRow["fulfillment_method"]
) {
  if (fulfillment === "collection" && status === "shipped") {
    return {
      label: "Ready for pick up",
      className: "bg-vb-accent-soft text-vb-accent",
    };
  }
  if (fulfillment === "collection" && status === "delivered") {
    return {
      label: "Picked up",
      className: "bg-emerald-50 text-emerald-800",
    };
  }

  switch (status) {
    case "pending_payment":
      return {
        label: "Unpaid",
        className: "bg-amber-50 text-amber-800",
      };
    case "cancelled":
    case "refunded":
      return {
        label: status === "refunded" ? "Refunded" : "Cancelled",
        className: "bg-red-50 text-red-800",
      };
    case "paid":
      return {
        label: "Paid",
        className: "bg-emerald-50 text-emerald-800",
      };
    case "pre_order":
      return {
        label: "Pre-order",
        className: "bg-vb-mist text-vb-ink",
      };
    case "processing":
    case "personalising":
      return {
        label: status === "personalising" ? "Personalising" : "Processing",
        className: "bg-sky-50 text-sky-800",
      };
    case "shipped":
      return {
        label: "Shipped",
        className: "bg-vb-accent-soft text-vb-accent",
      };
    case "delivered":
      return {
        label: "Delivered",
        className: "bg-emerald-50 text-emerald-800",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        className: "bg-vb-mist text-vb-muted",
      };
  }
}

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
        description="Tap an order to open it. Unpaid means checkout started but payment didn’t complete."
      />
      {loading && <AdminTableSkeleton rows={6} cols={5} />}
      {error && <AdminEmptyState title="Cannot load orders" body={error} />}
      {!loading && !error && orders.length === 0 && (
        <AdminEmptyState
          title="No orders yet"
          body="Orders appear here after a customer completes checkout."
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
              {orders.map((o) => {
                const meta = statusMeta(o.status, o.fulfillment_method);
                return (
                  <tr
                    key={o.id}
                    className="border-b border-vb-line last:border-0 hover:bg-vb-mist/60"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-vb-ink underline-offset-2 hover:text-vb-accent hover:underline"
                      >
                        {o.order_number}
                      </Link>
                      {o.fulfillment_method === "collection" && (
                        <span className="mt-0.5 block text-[10px] font-heading font-semibold uppercase tracking-[0.12em] text-vb-accent">
                          Click & pick up
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="block text-vb-ink hover:text-vb-accent"
                      >
                        <span className="block">{o.full_name}</span>
                        <span className="text-xs text-vb-muted">{o.email}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="block text-vb-ink hover:text-vb-accent"
                      >
                        {formatGbp(o.total_gbp)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="inline-flex">
                        <span
                          className={cn(
                            "inline-flex px-2 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em]",
                            meta.className
                          )}
                        >
                          {meta.label}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-vb-muted">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="block hover:text-vb-ink"
                      >
                        {new Date(o.created_at).toLocaleString("en-GB")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
