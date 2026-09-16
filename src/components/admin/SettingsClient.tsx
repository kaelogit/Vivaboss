"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminFormSkeleton } from "@/components/admin/AdminSkeleton";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import type {
  BrandSettings,
  ContactSettings,
  NotificationsSettings,
  ShippingSettings,
} from "@/lib/content/siteSettings";
import type { ShippingBand } from "@/lib/shipping";

const labelClass =
  "font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted";
const inputClass =
  "mt-1.5 h-10 w-full border border-vb-line bg-vb-paper px-3 text-sm outline-none ring-vb-accent focus:ring-1";
const areaClass =
  "mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm outline-none ring-vb-accent focus:ring-1";

type SettingsState = {
  contact: ContactSettings;
  brand: BrandSettings;
  shipping: ShippingSettings;
  notifications: NotificationsSettings;
};

function emptyBand(): ShippingBand {
  return { label: "", prefixes: [], rateGbp: 0 };
}

export default function SettingsClient() {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [stripeMode, setStripeMode] = useState<string>("unset");
  const [adminEmailsText, setAdminEmailsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (res) => {
        const data = (await res.json()) as {
          settings?: SettingsState;
          stripeMode?: string;
          error?: string;
        };
        if (!res.ok && !data.settings) {
          throw new Error(data.error ?? "Failed to load.");
        }
        if (!data.settings) throw new Error(data.error ?? "Failed to load.");
        setSettings(data.settings);
        setAdminEmailsText(data.settings.notifications.adminEmails.join(", "));
        setStripeMode(data.stripeMode ?? "unset");
        if (!res.ok) setError(data.error ?? null);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, []);

  const patchContact = (partial: Partial<ContactSettings>) =>
    setSettings((prev) =>
      prev ? { ...prev, contact: { ...prev.contact, ...partial } } : prev
    );
  const patchBrand = (partial: Partial<BrandSettings>) =>
    setSettings((prev) =>
      prev ? { ...prev, brand: { ...prev.brand, ...partial } } : prev
    );
  const patchShipping = (partial: Partial<ShippingSettings>) =>
    setSettings((prev) =>
      prev ? { ...prev, shipping: { ...prev.shipping, ...partial } } : prev
    );
  const patchNotifications = (partial: Partial<NotificationsSettings>) =>
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            notifications: { ...prev.notifications, ...partial },
          }
        : prev
    );

  const updateBand = (index: number, partial: Partial<ShippingBand>) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const bands = prev.shipping.bands.map((b, i) =>
        i === index ? { ...b, ...partial } : b
      );
      return { ...prev, shipping: { ...prev.shipping, bands } };
    });
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const notifications = {
      ...settings.notifications,
      adminEmails: adminEmailsText
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, notifications }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setSettings({ ...settings, notifications });
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
        title="Settings"
        description="Contact, WhatsApp, shipping rates, notification emails. Stripe keys stay in env."
      />

      {loading && <AdminFormSkeleton />}
      {!loading && !settings && error && (
        <AdminEmptyState title="Cannot load settings" body={error} />
      )}

      {settings && (
        <form onSubmit={onSave} className="space-y-8">
          {error && (
            <p className="border border-vb-danger/30 bg-vb-danger/5 px-4 py-3 text-sm text-vb-danger">
              {error}
            </p>
          )}
          {saved && (
            <p className="border border-vb-success/30 bg-vb-success/5 px-4 py-3 text-sm text-vb-success">
              Settings saved.
            </p>
          )}

          <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
              Contact
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass}
                  type="email"
                  value={settings.contact.email}
                  onChange={(e) => patchContact({ email: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  className={inputClass}
                  value={settings.contact.phone}
                  onChange={(e) => patchContact({ phone: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>WhatsApp (E.164)</label>
                <input
                  className={inputClass}
                  value={settings.contact.whatsapp}
                  onChange={(e) => patchContact({ whatsapp: e.target.value })}
                  placeholder="+447…"
                />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input
                  className={inputClass}
                  value={settings.contact.address}
                  onChange={(e) => patchContact({ address: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
              Brand
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  className={inputClass}
                  value={settings.brand.name}
                  onChange={(e) => patchBrand({ name: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Short name</label>
                <input
                  className={inputClass}
                  value={settings.brand.shortName}
                  onChange={(e) => patchBrand({ shortName: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Tagline</label>
                <input
                  className={inputClass}
                  value={settings.brand.tagline}
                  onChange={(e) => patchBrand({ tagline: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Homepage line</label>
                <input
                  className={inputClass}
                  value={settings.brand.homepageLine}
                  onChange={(e) =>
                    patchBrand({ homepageLine: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
              Shipping (UK)
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Default rate (GBP)</label>
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.shipping.defaultRateGbp ?? ""}
                  onChange={(e) =>
                    patchShipping({
                      defaultRateGbp:
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Free over (GBP)</label>
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.shipping.freeOverGbp ?? ""}
                  onChange={(e) =>
                    patchShipping({
                      freeOverGbp:
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                    })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-vb-ink">
                <input
                  type="checkbox"
                  checked={settings.shipping.ukWide}
                  onChange={(e) =>
                    patchShipping({ ukWide: e.target.checked })
                  }
                />
                UK-wide shipping
              </label>
              <label className="flex items-center gap-2 text-sm text-vb-ink">
                <input
                  type="checkbox"
                  checked={settings.shipping.collectionEnabled}
                  onChange={(e) =>
                    patchShipping({ collectionEnabled: e.target.checked })
                  }
                />
                Collection enabled
              </label>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
                  Postcode bands
                </h3>
                <button
                  type="button"
                  className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
                  onClick={() =>
                    patchShipping({
                      bands: [...settings.shipping.bands, emptyBand()],
                    })
                  }
                >
                  Add band
                </button>
              </div>
              <ul className="mt-4 space-y-4">
                {settings.shipping.bands.map((band, i) => (
                  <li
                    key={i}
                    className="grid gap-3 border border-vb-line bg-vb-paper p-4 sm:grid-cols-[1fr_1fr_6rem_auto]"
                  >
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        className={inputClass}
                        value={band.label}
                        onChange={(e) =>
                          updateBand(i, { label: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Prefixes (comma-separated)
                      </label>
                      <input
                        className={inputClass}
                        value={band.prefixes.join(", ")}
                        onChange={(e) =>
                          updateBand(i, {
                            prefixes: e.target.value
                              .split(/[\s,]+/)
                              .map((p) => p.trim().toUpperCase())
                              .filter(Boolean),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Rate</label>
                      <input
                        className={inputClass}
                        type="number"
                        step="0.01"
                        min="0"
                        value={band.rateGbp}
                        onChange={(e) =>
                          updateBand(i, {
                            rateGbp: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        className="h-10 px-2 text-xs text-vb-danger"
                        onClick={() =>
                          patchShipping({
                            bands: settings.shipping.bands.filter(
                              (_, j) => j !== i
                            ),
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
              Notifications
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelClass}>
                  Admin emails (comma-separated)
                </label>
                <textarea
                  className={areaClass}
                  rows={2}
                  value={adminEmailsText}
                  onChange={(e) => setAdminEmailsText(e.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["emailOnOrder", "Email on order"],
                    ["emailOnServiceJob", "Email on service job"],
                    ["emailOnCourierJob", "Email on courier job"],
                    ["emailOnCustomRequest", "Email on custom request"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm text-vb-ink"
                  >
                    <input
                      type="checkbox"
                      checked={settings.notifications[key]}
                      onChange={(e) =>
                        patchNotifications({ [key]: e.target.checked })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="border border-vb-line bg-vb-white p-5 sm:p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
              Payments
            </h2>
            <p className="mt-3 text-sm text-vb-muted">
              Stripe mode is controlled by{" "}
              <code className="text-vb-ink">STRIPE_SECRET_KEY</code> in env —
              not editable here.
            </p>
            <p className="mt-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-ink">
              Mode:{" "}
              <span className="text-vb-accent">{stripeMode}</span>
            </p>
          </section>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-paper transition-colors hover:bg-vb-accent disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
