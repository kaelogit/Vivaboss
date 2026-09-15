"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import type { FaqContent } from "@/lib/content/siteSettings";

const labelClass =
  "font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted";
const inputClass =
  "mt-1.5 h-10 w-full border border-vb-line bg-vb-paper px-3 text-sm outline-none ring-vb-accent focus:ring-1";
const areaClass =
  "mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm outline-none ring-vb-accent focus:ring-1";

type FaqItem = FaqContent["items"][number];

function emptyItem(): FaqItem {
  return { category: "Shop", q: "", a: "" };
}

export default function FaqContentClient() {
  const [items, setItems] = useState<FaqItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content/faq")
      .then(async (res) => {
        const data = (await res.json()) as {
          content?: FaqContent;
          error?: string;
        };
        if (!data.content) throw new Error(data.error ?? "Failed to load.");
        setItems(data.content.items);
        if (!res.ok) setError(data.error ?? null);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, []);

  const updateItem = (index: number, partial: Partial<FaqItem>) => {
    setItems((prev) =>
      prev
        ? prev.map((item, i) => (i === index ? { ...item, ...partial } : item))
        : prev
    );
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/content/faq", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = (await res.json()) as {
        content?: FaqContent;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      if (data.content) setItems(data.content.items);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="FAQ"
        description="Q&A items stored in site_settings (key: faq). Public FAQ prefers this over marketing defaults."
      />
      {loading && <p className="text-sm text-vb-muted">Loading…</p>}
      {!loading && !items && error && (
        <AdminEmptyState title="Cannot load FAQ" body={error} />
      )}
      {items && (
        <form onSubmit={onSave} className="space-y-6">
          {error && (
            <p className="border border-vb-danger/30 bg-vb-danger/5 px-4 py-3 text-sm text-vb-danger">
              {error}
            </p>
          )}
          {saved && (
            <p className="border border-vb-success/30 bg-vb-success/5 px-4 py-3 text-sm text-vb-success">
              FAQ saved.
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
              onClick={() => setItems([...items, emptyItem()])}
            >
              Add item
            </button>
          </div>

          <ul className="space-y-4">
            {items.map((item, i) => (
              <li
                key={i}
                className="border border-vb-line bg-vb-white p-5 sm:p-6"
              >
                <div className="grid gap-4 sm:grid-cols-[10rem_1fr_auto]">
                  <div>
                    <label className={labelClass}>Category</label>
                    <input
                      className={inputClass}
                      value={item.category}
                      onChange={(e) =>
                        updateItem(i, { category: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Question</label>
                    <input
                      className={inputClass}
                      value={item.q}
                      onChange={(e) => updateItem(i, { q: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="h-10 text-xs text-vb-danger"
                      onClick={() =>
                        setItems(items.filter((_, j) => j !== i))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Answer</label>
                  <textarea
                    className={areaClass}
                    rows={3}
                    value={item.a}
                    onChange={(e) => updateItem(i, { a: e.target.value })}
                  />
                </div>
              </li>
            ))}
          </ul>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-paper hover:bg-vb-accent disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save FAQ
          </button>
        </form>
      )}
    </div>
  );
}
