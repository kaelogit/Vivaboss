"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CustomFieldsEditor from "@/components/admin/CustomFieldsEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  emptyProductForm,
  type ProductFormInput,
} from "@/lib/admin/productForm";
import { nameToSlug } from "@/lib/products/slug";

const labelClass =
  "font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted";
const inputClass =
  "mt-1.5 h-10 w-full border border-vb-line bg-vb-paper px-3 text-sm outline-none ring-vb-accent focus:ring-1";
const areaClass =
  "mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm outline-none ring-vb-accent focus:ring-1";

type CategoryOption = { id: string; name: string; slug: string };

type Props = {
  productId?: string;
  initial?: ProductFormInput;
};

export default function ProductForm({ productId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormInput>(
    () => initial ?? { ...emptyProductForm }
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [slugManual, setSlugManual] = useState(Boolean(initial?.slug));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d: { categories?: CategoryOption[] }) =>
        setCategories(d.categories ?? [])
      )
      .catch(() => setCategories([]));
  }, []);

  const patch = (partial: Partial<ProductFormInput>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        productId ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: productId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = (await res.json()) as { error?: string; id?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setLoading(false);
    }
  };

  const archive = async () => {
    if (!productId) return;
    if (!confirm("Archive this product? It will leave the shop.")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Could not archive.");
      setLoading(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
          Basics
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                patch({
                  name,
                  slug: slugManual ? form.slug : nameToSlug(name),
                });
              }}
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              className={inputClass}
              required
              value={form.slug}
              onChange={(e) => {
                setSlugManual(true);
                patch({ slug: nameToSlug(e.target.value) });
              }}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              className={inputClass}
              required
              value={form.category_id}
              onChange={(e) => patch({ category_id: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) =>
                patch({
                  status: e.target.value as ProductFormInput["status"],
                })
              }
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Short description</label>
            <input
              className={inputClass}
              value={form.short_description}
              onChange={(e) => patch({ short_description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={areaClass}
              rows={5}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
          Media
        </h2>
        <div className="mt-5">
          <ImageUploader
            images={form.images}
            onChange={(images) => patch({ images })}
          />
        </div>
      </section>

      <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
          Pricing & inventory
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Price (GBP)</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              step="0.01"
              value={form.price_gbp}
              onChange={(e) => patch({ price_gbp: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelClass}>Compare at (optional)</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              step="0.01"
              value={form.compare_at_gbp ?? ""}
              onChange={(e) =>
                patch({
                  compare_at_gbp: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Cost (internal)</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              step="0.01"
              value={form.cost_gbp ?? ""}
              onChange={(e) =>
                patch({
                  cost_gbp: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.track_stock}
              onChange={(e) => patch({ track_stock: e.target.checked })}
            />
            Track stock
          </label>
          {form.track_stock && (
            <>
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={form.stock_quantity ?? 0}
                  onChange={(e) =>
                    patch({ stock_quantity: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Low stock at</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={form.low_stock_threshold}
                  onChange={(e) =>
                    patch({ low_stock_threshold: Number(e.target.value) })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.allow_preorder}
                  onChange={(e) =>
                    patch({ allow_preorder: e.target.checked })
                  }
                />
                Allow pre-order when out of stock
              </label>
            </>
          )}
        </div>
      </section>

      <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
          Product type
        </h2>
        <div className="mt-5 space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_customisable}
              onChange={(e) =>
                patch({
                  is_customisable: e.target.checked,
                  requires_approval: e.target.checked
                    ? form.requires_approval
                    : false,
                })
              }
            />
            Customisable (options / uploads on product page)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.requires_approval}
              disabled={!form.is_customisable}
              onChange={(e) => patch({ requires_approval: e.target.checked })}
            />
            Requires design approval (request quote instead of add to cart)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.offers_installation}
              onChange={(e) =>
                patch({ offers_installation: e.target.checked })
              }
            />
            Offer installation add-on
          </label>
        </div>

        {form.offers_installation && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Installation service</label>
              <select
                className={inputClass}
                value={form.installation_service_key}
                onChange={(e) =>
                  patch({ installation_service_key: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="smart-home">Smart home install</option>
                <option value="home">Home services install</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Install price GBP (empty = quote)
              </label>
              <input
                className={inputClass}
                type="number"
                min={0}
                step="0.01"
                value={form.installation_price_gbp ?? ""}
                onChange={(e) =>
                  patch({
                    installation_price_gbp: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            </div>
          </div>
        )}
      </section>

      {form.is_customisable && (
        <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
            Custom fields
          </h2>
          <p className="mt-2 text-sm text-vb-muted">
            Customers fill these on the product page. File fields support photo
            uploads for engraving.
          </p>
          <div className="mt-5">
            <CustomFieldsEditor
              fields={form.custom_fields}
              onChange={(custom_fields) => patch({ custom_fields })}
              disabled={loading}
            />
          </div>
        </section>
      )}

      <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
          SEO
        </h2>
        <div className="mt-5 grid gap-4">
          <div>
            <label className={labelClass}>Meta title</label>
            <input
              className={inputClass}
              value={form.meta_title}
              onChange={(e) => patch({ meta_title: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Meta description</label>
            <textarea
              className={areaClass}
              rows={3}
              value={form.meta_description}
              onChange={(e) => patch({ meta_description: e.target.value })}
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="text-sm text-vb-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {productId ? "Save changes" : "Create product"}
        </button>
        {productId && (
          <button
            type="button"
            disabled={loading}
            onClick={archive}
            className="h-11 border border-vb-line px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-muted hover:text-vb-danger"
          >
            Archive
          </button>
        )}
      </div>
    </form>
  );
}
