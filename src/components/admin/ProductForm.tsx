"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CustomFieldsEditor from "@/components/admin/CustomFieldsEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  SELL_KIND_OPTIONS,
  applySellKind,
  emptyProductForm,
  sellKindFromForm,
  type ProductFormInput,
  type ProductSellKind,
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
  const isNew = !productId;
  const [kind, setKind] = useState<ProductSellKind | null>(() =>
    initial ? sellKindFromForm(initial) : null
  );
  const [form, setForm] = useState<ProductFormInput>(
    () => initial ?? { ...emptyProductForm }
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [showMore, setShowMore] = useState(false);
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

  const pickKind = (next: ProductSellKind) => {
    setKind(next);
    setForm((prev) => applySellKind(prev, next));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kind) {
      setError("Pick how customers buy this product first.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = applySellKind(
      {
        ...form,
        slug: form.slug || nameToSlug(form.name),
      },
      kind
    );

    try {
      const res = await fetch(
        productId ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: productId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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

  const removeProduct = async () => {
    if (!productId) return;
    if (
      !confirm(
        "Delete this product permanently? It leaves the shop and this list. Past orders keep the item name."
      )
    ) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Could not delete.");
      setLoading(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  /* ── Step 1: pick kind (new products) ── */
  if (isNew && !kind) {
    return (
      <div className="space-y-6">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-vb-ink">
          How do customers get this?
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {SELL_KIND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => pickKind(opt.id)}
              className="border border-vb-line bg-vb-white p-6 text-left transition-colors hover:border-vb-ink hover:bg-vb-mist"
            >
              <span className="font-heading text-base font-bold uppercase tracking-tight text-vb-ink">
                {opt.title}
              </span>
              <span className="mt-3 block text-sm leading-relaxed text-vb-muted">
                {opt.hint}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const activeKind = kind ?? "ready";
  const kindMeta = SELL_KIND_OPTIONS.find((o) => o.id === activeKind)!;
  const showQuestions = activeKind === "customise" || activeKind === "quote";
  const showStock = activeKind !== "quote";
  const showInstall = activeKind === "ready" || activeKind === "customise";
  const priceLabel =
    activeKind === "quote" ? "From price (GBP)" : "Price (GBP)";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Kind switcher */}
      <section className="border border-vb-line bg-vb-white p-4 sm:p-5">
        <p className={labelClass}>Product type</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {SELL_KIND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => pickKind(opt.id)}
              className={`border px-4 py-3 text-left transition-colors ${
                activeKind === opt.id
                  ? "border-vb-ink bg-vb-ink text-vb-paper"
                  : "border-vb-line bg-vb-paper text-vb-ink hover:border-vb-ink"
              }`}
            >
              <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em]">
                {opt.title}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-vb-muted">{kindMeta.hint}</p>
      </section>

      {/* Essentials */}
      <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
          The product
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
                patch({ name, slug: nameToSlug(name) });
              }}
              placeholder="e.g. Ankara crossbody"
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
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{priceLabel}</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              step="0.01"
              value={form.price_gbp}
              onChange={(e) => patch({ price_gbp: Number(e.target.value) })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Short line (optional)</label>
            <input
              className={inputClass}
              value={form.short_description}
              onChange={(e) => patch({ short_description: e.target.value })}
              placeholder="One line under the name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Story (optional)</label>
            <textarea
              className={areaClass}
              rows={4}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Photos */}
      <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
          Photos
        </h2>
        <div className="mt-5">
          <ImageUploader
            images={form.images}
            onChange={(images) => patch({ images })}
          />
        </div>
      </section>

      {/* Stock — not for quote */}
      {showStock && (
        <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
            Stock
          </h2>
          <div className="mt-5 space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.track_stock}
                onChange={(e) => patch({ track_stock: e.target.checked })}
              />
              Count stock
            </label>
            {form.track_stock && (
              <div className="grid max-w-xs gap-4">
                <div>
                  <label className={labelClass}>How many left</label>
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
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allow_preorder}
                    onChange={(e) =>
                      patch({ allow_preorder: e.target.checked })
                    }
                  />
                  Allow pre-order if sold out
                </label>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Customer questions */}
      {showQuestions && (
        <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
            {activeKind === "quote"
              ? "What they send you"
              : "What they choose"}
          </h2>
          <div className="mt-5">
            <CustomFieldsEditor
              fields={form.custom_fields}
              onChange={(custom_fields) => patch({ custom_fields })}
              disabled={loading}
              mode={activeKind === "quote" ? "quote" : "customise"}
            />
          </div>
        </section>
      )}

      {/* Install add-on */}
      {showInstall && (
        <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
            Install? (optional)
          </h2>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.offers_installation}
              onChange={(e) =>
                patch({
                  offers_installation: e.target.checked,
                  installation_service_key: e.target.checked
                    ? form.installation_service_key || "smart-home"
                    : "",
                })
              }
            />
            Customer can book install with this product
          </label>
          {form.offers_installation && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Install type</label>
                <select
                  className={inputClass}
                  value={form.installation_service_key}
                  onChange={(e) =>
                    patch({ installation_service_key: e.target.value })
                  }
                >
                  <option value="smart-home">Smart home</option>
                  <option value="home">Home services</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Install price (empty = quote)</label>
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
      )}

      {/* Go live */}
      <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
          Ready?
        </h2>
        <div className="mt-4 max-w-xs">
          <label className={labelClass}>Show in shop</label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) =>
              patch({
                status: e.target.value as ProductFormInput["status"],
              })
            }
          >
            <option value="draft">Not yet (draft)</option>
            <option value="active">Yes — live</option>
            <option value="archived">Hidden</option>
          </select>
        </div>
      </section>

      {/* More — collapsed */}
      <div>
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted hover:text-vb-ink"
        >
          {showMore ? "Hide extra settings ↑" : "Extra settings ↓"}
        </button>
        {showMore && (
          <section className="mt-4 space-y-4 border border-vb-line bg-vb-white p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Was £ (optional)</label>
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
                <label className={labelClass}>Your cost (optional)</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.cost_gbp ?? ""}
                  onChange={(e) =>
                    patch({
                      cost_gbp: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </div>
              {form.track_stock && (
                <div>
                  <label className={labelClass}>Low stock warning at</label>
                  <input
                    className={inputClass}
                    type="number"
                    min={0}
                    value={form.low_stock_threshold}
                    onChange={(e) =>
                      patch({
                        low_stock_threshold: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <label className={labelClass}>URL name (auto)</label>
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(e) =>
                    patch({ slug: nameToSlug(e.target.value) })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Google title</label>
                <input
                  className={inputClass}
                  value={form.meta_title}
                  onChange={(e) => patch({ meta_title: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Google description</label>
                <textarea
                  className={areaClass}
                  rows={2}
                  value={form.meta_description}
                  onChange={(e) =>
                    patch({ meta_description: e.target.value })
                  }
                />
              </div>
            </div>
          </section>
        )}
      </div>

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
          {productId ? "Save" : "Add product"}
        </button>
        {productId && (
          <button
            type="button"
            disabled={loading}
            onClick={removeProduct}
            className="h-11 border border-vb-line px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted hover:text-vb-danger"
          >
            Delete product
          </button>
        )}
      </div>
    </form>
  );
}
