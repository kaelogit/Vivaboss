"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminFormSkeleton } from "@/components/admin/AdminSkeleton";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import type { HomepageContent } from "@/lib/content/siteSettings";

const labelClass =
  "font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted";
const inputClass =
  "mt-1.5 h-10 w-full border border-vb-line bg-vb-paper px-3 text-sm outline-none ring-vb-accent focus:ring-1";
const areaClass =
  "mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm outline-none ring-vb-accent focus:ring-1";

const FIELDS: Array<{
  key: keyof HomepageContent;
  label: string;
  area?: boolean;
}> = [
  { key: "heroEyebrow", label: "Hero eyebrow" },
  { key: "heroHeadline", label: "Hero headline" },
  { key: "heroSub", label: "Hero sub" },
  { key: "heroTagline", label: "Hero mantra (owner line)", area: true },
  { key: "pathChooserEyebrow", label: "Path chooser eyebrow" },
  { key: "pathChooserTitle", label: "Path chooser title" },
  { key: "craftHeadline", label: "Founder story headline" },
  { key: "craftBody", label: "Founder story body (legacy / unused on storefront)", area: true },
];

export default function HomepageContentClient() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content/homepage")
      .then(async (res) => {
        const data = (await res.json()) as {
          content?: HomepageContent;
          error?: string;
        };
        if (!data.content) throw new Error(data.error ?? "Failed to load.");
        setContent(data.content);
        if (!res.ok) setError(data.error ?? null);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/content/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await res.json()) as {
        content?: HomepageContent;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      if (data.content) setContent(data.content);
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
        title="Homepage"
        description="Hero and intro copy stored in site_settings (key: homepage)."
      />
      {loading && <AdminFormSkeleton />}
      {!loading && !content && error && (
        <AdminEmptyState title="Cannot load homepage" body={error} />
      )}
      {content && (
        <form onSubmit={onSave} className="space-y-6">
          {error && (
            <p className="border border-vb-danger/30 bg-vb-danger/5 px-4 py-3 text-sm text-vb-danger">
              {error}
            </p>
          )}
          {saved && (
            <p className="border border-vb-success/30 bg-vb-success/5 px-4 py-3 text-sm text-vb-success">
              Homepage saved.
            </p>
          )}
          <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
            <div className="grid gap-4">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className={labelClass}>{f.label}</label>
                  {f.area ? (
                    <textarea
                      className={areaClass}
                      rows={3}
                      value={content[f.key]}
                      onChange={(e) =>
                        setContent({ ...content, [f.key]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      className={inputClass}
                      value={content[f.key]}
                      onChange={(e) =>
                        setContent({ ...content, [f.key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-paper hover:bg-vb-accent disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save homepage
          </button>
        </form>
      )}
    </div>
  );
}
