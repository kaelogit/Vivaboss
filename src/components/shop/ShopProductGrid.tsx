"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/shop/ProductCard";
import type { ProductWithCategory } from "@/lib/products/queries";

type SortKey = "newest" | "price_asc" | "price_desc" | "name";

export default function ShopProductGrid({
  products,
  initialQuery = "",
}: {
  products: ProductWithCategory[];
  initialQuery?: string;
}) {
  const [sort, setSort] = useState<SortKey>("newest");
  const [customOnly, setCustomOnly] = useState(false);
  const [installOnly, setInstallOnly] = useState(false);
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = [...products];
    if (needle) {
      list = list.filter((p) => {
        const haystack = [
          p.name,
          p.short_description,
          p.description,
          p.categories?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      });
    }
    if (customOnly) list = list.filter((p) => p.is_customisable);
    if (installOnly) list = list.filter((p) => p.offers_installation);
    list.sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return Number(a.price_gbp) - Number(b.price_gbp);
        case "price_desc":
          return Number(b.price_gbp) - Number(a.price_gbp);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
    return list;
  }, [products, sort, customOnly, installOnly, query]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-vb-muted">
          {filtered.length} product{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="shop-search">
            Search products
          </label>
          <input
            id="shop-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm text-vb-ink placeholder:text-vb-muted sm:w-56"
          />
          <label className="flex items-center gap-2 text-sm text-vb-muted">
            <input
              type="checkbox"
              checked={customOnly}
              onChange={(e) => setCustomOnly(e.target.checked)}
            />
            Has options / quote
          </label>
          <label className="flex items-center gap-2 text-sm text-vb-muted">
            <input
              type="checkbox"
              checked={installOnly}
              onChange={(e) => setInstallOnly(e.target.checked)}
            />
            Install available
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border border-vb-line bg-vb-paper px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-vb-line bg-vb-white px-6 py-12 text-center text-sm text-vb-muted">
          {query.trim()
            ? `No products match “${query.trim()}”.`
            : "No products match these filters."}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-3">
          {filtered.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
