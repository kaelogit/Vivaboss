"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatGbp } from "@/lib/products/money";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price_gbp: number;
  status: string;
  images: string[];
  stock_quantity: number | null;
  track_stock: boolean;
  is_customisable: boolean;
  requires_approval: boolean;
  offers_installation: boolean;
  categories: { id: string; slug: string; name: string } | null;
};

export default function ProductsList() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    fetch("/api/admin/products")
      .then(async (res) => {
        const data = (await res.json()) as {
          products?: AdminProduct[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load products.");
        setProducts(data.products ?? []);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q.trim()) return true;
      const hay = `${p.name} ${p.slug} ${p.categories?.name ?? ""}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [products, q, status]);

  if (loading) {
    return <p className="text-sm text-vb-muted">Loading products…</p>;
  }

  if (error) {
    return (
      <div className="border border-vb-line bg-vb-white px-6 py-10">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-vb-ink">
          Cannot load products
        </p>
        <p className="mt-3 text-sm text-vb-muted">{error}</p>
        <p className="mt-3 text-xs text-vb-muted">
          Run migration{" "}
          <code className="text-vb-ink">20260314130000_products.sql</code> and
          ensure service role keys are in <code>.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="h-10 flex-1 border border-vb-line bg-vb-white px-3 text-sm outline-none ring-vb-accent focus:ring-1"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 border border-vb-line bg-vb-white px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-vb-line bg-vb-white px-6 py-16 text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em]">
            No products yet
          </p>
          <p className="mt-3 text-sm text-vb-muted">
            Create your first product, or run the products migration for demo
            seeds.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-6 inline-flex h-10 items-center bg-vb-ink px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-paper"
          >
            Add product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-vb-line bg-vb-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-vb-line bg-vb-mist font-heading text-[10px] uppercase tracking-[0.16em] text-vb-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Flags</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-vb-line last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex items-center gap-3 hover:text-vb-accent"
                    >
                      <span className="h-12 w-12 shrink-0 bg-vb-mist">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </span>
                      <span>
                        <span className="block font-medium text-vb-ink">
                          {p.name}
                        </span>
                        <span className="text-xs text-vb-muted">{p.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-vb-muted">
                    {p.categories?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{formatGbp(p.price_gbp)}</td>
                  <td className="px-4 py-3 text-vb-muted">
                    {p.track_stock ? (p.stock_quantity ?? 0) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.is_customisable && (
                        <span className="bg-vb-accent-soft px-1.5 py-0.5 font-heading text-[9px] font-semibold uppercase tracking-wider text-vb-accent">
                          Custom
                        </span>
                      )}
                      {p.requires_approval && (
                        <span className="bg-vb-mist px-1.5 py-0.5 font-heading text-[9px] font-semibold uppercase tracking-wider text-vb-muted">
                          Approval
                        </span>
                      )}
                      {p.offers_installation && (
                        <span className="bg-vb-mist px-1.5 py-0.5 font-heading text-[9px] font-semibold uppercase tracking-wider text-vb-muted">
                          Install
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-vb-muted">
                    {p.status}
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
