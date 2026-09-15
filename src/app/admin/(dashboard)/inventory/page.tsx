"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";

type StockProduct = {
  id: string;
  name: string;
  slug: string;
  stock_quantity: number | null;
  low_stock_threshold: number;
  status: string;
  images: string[];
  categories: { name: string } | null;
};

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lowOnly, setLowOnly] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/inventory")
      .then(async (res) => {
        const data = (await res.json()) as {
          products?: StockProduct[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setProducts(data.products ?? []);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const adjust = async (productId: string, delta: number) => {
    setBusyId(productId);
    setError(null);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, delta }),
      });
      const data = (await res.json()) as {
        stock_quantity?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Adjust failed.");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock_quantity: data.stock_quantity ?? p.stock_quantity }
            : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adjust failed.");
    } finally {
      setBusyId(null);
    }
  };

  const visible = lowOnly
    ? products.filter(
        (p) =>
          (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 5)
      )
    : products;

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description="Stock levels for tracked products. Paid orders decrement automatically."
      />

      <div className="mb-4 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-vb-muted">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
          />
          Low stock only
        </label>
      </div>

      {loading && <p className="text-sm text-vb-muted">Loading…</p>}
      {error && <p className="mb-4 text-sm text-vb-danger">{error}</p>}
      {!loading && visible.length === 0 && (
        <AdminEmptyState
          title="No tracked stock"
          body="Enable track stock on products, or clear the low-stock filter."
        />
      )}
      {!loading && visible.length > 0 && (
        <div className="overflow-x-auto border border-vb-line bg-vb-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-vb-line bg-vb-mist font-heading text-[10px] uppercase tracking-[0.16em] text-vb-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const low =
                  (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 5);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-vb-line last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-vb-muted">{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-vb-muted">
                      {p.categories?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          low ? "font-semibold text-vb-danger" : "text-vb-ink"
                        }
                      >
                        {p.stock_quantity ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => adjust(p.id, -1)}
                          className="h-8 w-8 border border-vb-line hover:border-vb-ink"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => adjust(p.id, 1)}
                          className="h-8 w-8 border border-vb-line hover:border-vb-ink"
                        >
                          +
                        </button>
                        {busyId === p.id && (
                          <Loader2 size={14} className="animate-spin text-vb-muted" />
                        )}
                      </div>
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
