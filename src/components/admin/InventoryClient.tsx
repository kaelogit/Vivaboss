"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Minus, Plus, ExternalLink } from "lucide-react";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { formatGbp } from "@/lib/products/money";
import { cn } from "@/lib/utils";

type StockProduct = {
  id: string;
  name: string;
  slug: string;
  track_stock: boolean;
  stock_quantity: number | null;
  low_stock_threshold: number;
  allow_preorder: boolean;
  status: string;
  images: string[];
  price_gbp: number;
  categories: { id: string; name: string; slug: string } | null;
};

type StockFilter = "all" | "tracked" | "low" | "out" | "untracked";

const inputClass =
  "h-9 border border-vb-line bg-vb-paper px-3 text-sm text-vb-ink outline-none ring-vb-accent focus:ring-1";

export default function InventoryClient() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [draftQty, setDraftQty] = useState<Record<string, string>>({});
  const [draftThreshold, setDraftThreshold] = useState<Record<string, string>>(
    {}
  );

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/inventory")
      .then(async (res) => {
        const data = (await res.json()) as {
          products?: StockProduct[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        const rows = data.products ?? [];
        setProducts(rows);
        const qty: Record<string, string> = {};
        const thr: Record<string, string> = {};
        for (const p of rows) {
          qty[p.id] = String(p.stock_quantity ?? 0);
          thr[p.id] = String(p.low_stock_threshold ?? 5);
        }
        setDraftQty(qty);
        setDraftThreshold(thr);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (p.categories) map.set(p.categories.slug, p.categories.name);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [products]);

  const stats = useMemo(() => {
    const tracked = products.filter((p) => p.track_stock);
    const out = tracked.filter((p) => (p.stock_quantity ?? 0) <= 0);
    const low = tracked.filter(
      (p) =>
        (p.stock_quantity ?? 0) > 0 &&
        (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 5)
    );
    return {
      total: products.length,
      tracked: tracked.length,
      low: low.length,
      out: out.length,
    };
  }, [products]);

  const visible = useMemo(() => {
    return products.filter((p) => {
      if (category !== "all" && p.categories?.slug !== category) return false;
      if (q.trim()) {
        const hay =
          `${p.name} ${p.slug} ${p.categories?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      const qty = p.stock_quantity ?? 0;
      const thr = p.low_stock_threshold ?? 5;
      if (stockFilter === "tracked" && !p.track_stock) return false;
      if (stockFilter === "untracked" && p.track_stock) return false;
      if (stockFilter === "out" && (!p.track_stock || qty > 0)) return false;
      if (
        stockFilter === "low" &&
        (!p.track_stock || qty <= 0 || qty > thr)
      )
        return false;
      return true;
    });
  }, [products, category, q, stockFilter]);

  const patchLocal = (id: string, patch: Partial<StockProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const post = async (
    body: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as Record<string, unknown> & {
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Update failed.");
    return data;
  };

  const adjust = async (productId: string, delta: number) => {
    setBusyId(productId);
    setError(null);
    try {
      const data = await post({ productId, action: "adjust", delta });
      const qty = Number(data.stock_quantity ?? 0);
      patchLocal(productId, { stock_quantity: qty, track_stock: true });
      setDraftQty((d) => ({ ...d, [productId]: String(qty) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adjust failed.");
    } finally {
      setBusyId(null);
    }
  };

  const saveQty = async (productId: string) => {
    const raw = draftQty[productId];
    const quantity = Math.max(0, Math.floor(Number(raw)));
    if (!Number.isFinite(quantity)) {
      setError("Enter a valid quantity.");
      return;
    }
    setBusyId(productId);
    setError(null);
    try {
      const data = await post({ productId, action: "set", quantity });
      const qty = Number(data.stock_quantity ?? quantity);
      patchLocal(productId, { stock_quantity: qty, track_stock: true });
      setDraftQty((d) => ({ ...d, [productId]: String(qty) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleTrack = async (p: StockProduct) => {
    setBusyId(p.id);
    setError(null);
    try {
      const next = !p.track_stock;
      const data = await post({
        productId: p.id,
        action: "settings",
        track_stock: next,
        quantity: next ? Number(draftQty[p.id] ?? p.stock_quantity ?? 0) : null,
      });
      const qty =
        data.stock_quantity == null ? null : Number(data.stock_quantity);
      patchLocal(p.id, {
        track_stock: Boolean(data.track_stock),
        stock_quantity: qty,
      });
      if (qty != null) {
        setDraftQty((d) => ({ ...d, [p.id]: String(qty) }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  const saveThreshold = async (productId: string) => {
    const raw = draftThreshold[productId];
    const low_stock_threshold = Math.max(0, Math.floor(Number(raw)));
    if (!Number.isFinite(low_stock_threshold)) {
      setError("Enter a valid low-stock threshold.");
      return;
    }
    setBusyId(productId);
    setError(null);
    try {
      const data = await post({
        productId,
        action: "settings",
        low_stock_threshold,
      });
      patchLocal(productId, {
        low_stock_threshold: Number(data.low_stock_threshold),
      });
      setDraftThreshold((d) => ({
        ...d,
        [productId]: String(data.low_stock_threshold),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description="Track stock, set quantities, and low-stock alerts. Paid orders decrement automatically."
        action={{ href: "/admin/products/new", label: "Add product" }}
      />

      {!loading && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Products", value: stats.total },
            { label: "Tracked", value: stats.tracked },
            { label: "Low stock", value: stats.low },
            { label: "Out of stock", value: stats.out },
          ].map((s) => (
            <div
              key={s.label}
              className="border border-vb-line bg-vb-white px-4 py-3"
            >
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
                {s.label}
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-vb-ink">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 grid gap-3 border border-vb-line bg-vb-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
            Search
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, slug, category…"
            className={cn(inputClass, "w-full")}
          />
        </div>
        <div>
          <label className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={cn(inputClass, "w-full")}
          >
            <option value="all">All</option>
            {categories.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
            Stock
          </label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            className={cn(inputClass, "w-full")}
          >
            <option value="all">All</option>
            <option value="tracked">Tracked</option>
            <option value="untracked">Not tracked</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
      </div>

      {loading && <AdminTableSkeleton rows={8} cols={5} />}
      {error && <p className="mb-4 text-sm text-vb-danger">{error}</p>}

      {!loading && visible.length === 0 && (
        <AdminEmptyState
          title="No products match"
          body="Add products or clear filters. Enable Track stock on a product to manage quantity here."
        />
      )}

      {!loading && visible.length > 0 && (
        <div className="overflow-x-auto border border-vb-line bg-vb-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-vb-line bg-vb-mist font-heading text-[10px] uppercase tracking-[0.16em] text-vb-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Track</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Low at</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const qty = p.stock_quantity ?? 0;
                const thr = p.low_stock_threshold ?? 5;
                const out = p.track_stock && qty <= 0;
                const low = p.track_stock && qty > 0 && qty <= thr;
                const busy = busyId === p.id;
                const img = p.images?.[0];

                return (
                  <tr
                    key={p.id}
                    className="border-b border-vb-line last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-vb-mist">
                          {img ? (
                            <Image
                              src={img}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-vb-ink">
                            {p.name}
                          </p>
                          <p className="truncate text-xs text-vb-muted">
                            {p.categories?.name ?? "Uncategorised"} ·{" "}
                            {formatGbp(p.price_gbp)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 text-xs text-vb-ink">
                        <input
                          type="checkbox"
                          checked={p.track_stock}
                          disabled={busy}
                          onChange={() => toggleTrack(p)}
                        />
                        {p.track_stock ? "On" : "Off"}
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      {p.track_stock ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={busy || qty <= 0}
                            onClick={() => adjust(p.id, -1)}
                            className="inline-flex h-8 w-8 items-center justify-center border border-vb-line hover:border-vb-ink disabled:opacity-40"
                            aria-label="Decrease"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            className={cn(inputClass, "w-20 text-center")}
                            type="number"
                            min={0}
                            value={draftQty[p.id] ?? String(qty)}
                            disabled={busy}
                            onChange={(e) =>
                              setDraftQty((d) => ({
                                ...d,
                                [p.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void saveQty(p.id);
                            }}
                            onBlur={() => {
                              if (draftQty[p.id] !== String(qty)) {
                                void saveQty(p.id);
                              }
                            }}
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => adjust(p.id, 1)}
                            className="inline-flex h-8 w-8 items-center justify-center border border-vb-line hover:border-vb-ink disabled:opacity-40"
                            aria-label="Increase"
                          >
                            <Plus size={14} />
                          </button>
                          {busy && (
                            <Loader2
                              size={14}
                              className="animate-spin text-vb-muted"
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-vb-muted">
                          Not tracked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.track_stock ? (
                        <input
                          className={cn(inputClass, "w-20")}
                          type="number"
                          min={0}
                          value={draftThreshold[p.id] ?? String(thr)}
                          disabled={busy}
                          onChange={(e) =>
                            setDraftThreshold((d) => ({
                              ...d,
                              [p.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void saveThreshold(p.id);
                          }}
                          onBlur={() => {
                            if (draftThreshold[p.id] !== String(thr)) {
                              void saveThreshold(p.id);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xs text-vb-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs capitalize text-vb-muted">
                          {p.status.replace(/_/g, " ")}
                        </span>
                        {out && (
                          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-danger">
                            Out of stock
                            {p.allow_preorder ? " · pre-order on" : ""}
                          </span>
                        )}
                        {low && (
                          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-accent">
                            Low stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex items-center gap-1 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-accent hover:text-vb-accent-hover"
                      >
                        Edit <ExternalLink size={12} />
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
