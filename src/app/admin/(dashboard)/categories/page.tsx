"use client";

import { useEffect, useState } from "react";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_visible: boolean;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(async (res) => {
        const data = (await res.json()) as {
          categories?: Category[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setCategories(data.categories ?? []);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Fashion, Personalised, Smart Home, Home & DIY — seeded from migration."
      />

      {loading && <AdminTableSkeleton rows={4} cols={4} />}
      {error && (
        <AdminEmptyState title="Cannot load categories" body={error} />
      )}
      {!loading && !error && categories.length === 0 && (
        <AdminEmptyState
          title="No categories"
          body="Run the init migration to seed the four shop categories."
        />
      )}
      {!loading && !error && categories.length > 0 && (
        <div className="overflow-x-auto border border-vb-line bg-vb-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-vb-line bg-vb-mist font-heading text-[10px] uppercase tracking-[0.16em] text-vb-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Visible</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-vb-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-vb-muted">{c.description}</p>
                  </td>
                  <td className="px-4 py-3 text-vb-muted">{c.slug}</td>
                  <td className="px-4 py-3 text-vb-muted">{c.sort_order}</td>
                  <td className="px-4 py-3 text-vb-muted">
                    {c.is_visible ? "Yes" : "No"}
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
