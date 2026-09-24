"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import BookingSteps from "@/components/bookings/BookingSteps";
import {
  COURIER_URGENCIES,
  COURIER_VERTICALS,
} from "@/lib/bookings/labels";
import { whatsappHref } from "@/lib/navigation";
import { isWhatsAppLive } from "@/lib/site";
import type { CourierUrgency, CourierVertical } from "@/types/database";

const fieldClass =
  "mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm";
const labelClass =
  "font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted";

export default function CourierBookingForm({
  initialVertical = "general",
}: {
  initialVertical?: CourierVertical;
}) {
  const [vertical, setVertical] = useState<CourierVertical>(initialVertical);
  const [urgency, setUrgency] = useState<CourierUrgency>("standard");
  const [itemDescription, setItemDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupLine1, setPickupLine1] = useState("");
  const [pickupLine2, setPickupLine2] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupPostcode, setPickupPostcode] = useState("");
  const [dropoffLine1, setDropoffLine1] = useState("");
  const [dropoffLine2, setDropoffLine2] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");
  const [dropoffPostcode, setDropoffPostcode] = useState("");
  const [preferredWindow, setPreferredWindow] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const waLive = isWhatsAppLive();
  const waMessage = useMemo(
    () =>
      `Hi Vivaboss — I submitted a courier request (${vertical}). Pickup ${pickupPostcode || "—"} → ${dropoffPostcode || "—"}.`,
    [vertical, pickupPostcode, dropoffPostcode]
  );

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 4)) {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", "bookings");
        const res = await fetch("/api/upload/personalisation", {
          method: "POST",
          body: form,
        });
        const data = (await res.json()) as { path?: string; error?: string };
        if (!res.ok || !data.path) {
          throw new Error(data.error ?? "Upload failed.");
        }
        urls.push(data.path);
      }
      setPhotos((prev) => [...prev, ...urls].slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/courier-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vertical,
          urgency,
          itemDescription,
          notes,
          photos,
          pickupLine1,
          pickupLine2,
          pickupCity,
          pickupPostcode,
          dropoffLine1,
          dropoffLine2,
          dropoffCity,
          dropoffPostcode,
          preferredWindow,
          fullName,
          email,
          phone,
          whatsapp: phone,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        throw new Error(data.error ?? "Could not submit request.");
      }
      setDoneId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (doneId) {
    return (
      <div className="border border-vb-line bg-vb-white p-8 sm:p-10">
        <p className="vb-eyebrow text-vb-accent">Submitted</p>
        <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight">
          Courier request received
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-vb-muted">
          Thanks — we’ll confirm pickup and timing shortly
          {pickupPostcode && dropoffPostcode
            ? ` for ${pickupPostcode.toUpperCase()} → ${dropoffPostcode.toUpperCase()}`
            : ""}
          .
        </p>
        {waLive && (
          <a
            href={whatsappHref(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-vb-ink hover:text-vb-paper"
          >
            Continue on WhatsApp
          </a>
        )}
      </div>
    );
  }

  const steps = ["The item", "Addresses", "Contact"] as const;

  const continueStep = () => {
    if (step === 0 && !itemDescription.trim()) {
      setError("Describe what we’re moving.");
      return;
    }
    if (
      step === 1 &&
      (!pickupLine1.trim() ||
        !pickupPostcode.trim() ||
        !dropoffLine1.trim() ||
        !dropoffPostcode.trim())
    ) {
      setError("Add a street and postcode for both pickup and drop-off.");
      return;
    }
    setError(null);
    setStep((n) => Math.min(n + 1, steps.length - 1));
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-8 border border-vb-line bg-vb-white p-6 sm:p-10"
    >
      <BookingSteps steps={steps} current={step} />

      {step === 0 && (
      <>
      <div>
        <p className="vb-eyebrow">Delivery</p>
        <h2 className="mt-2 font-heading text-xl font-bold uppercase tracking-tight">
          What are we moving?
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Type</span>
            <select
              required
              value={vertical}
              onChange={(e) => setVertical(e.target.value as CourierVertical)}
              className={fieldClass}
            >
              {COURIER_VERTICALS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Urgency</span>
            <select
              required
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as CourierUrgency)}
              className={fieldClass}
            >
              {COURIER_URGENCIES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Item description *</span>
            <textarea
              required
              rows={3}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Documents, flowers, medical package…"
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Notes</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Handling notes, recipient name, access codes…"
              className={fieldClass}
            />
          </label>
        </div>
      </div>

      <div>
        <p className={labelClass}>Photos (optional)</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={uploading}
          onChange={(e) => void uploadPhotos(e.target.files)}
          className="mt-2 block w-full text-sm text-vb-muted file:mr-3 file:border-0 file:bg-vb-mist file:px-3 file:py-2 file:font-heading file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.14em]"
        />
        {photos.length > 0 && (
          <p className="mt-2 text-xs text-vb-muted">
            {photos.length} photo{photos.length === 1 ? "" : "s"} attached
          </p>
        )}
      </div>
      </>
      )}

      {step === 1 && (
      <>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="vb-eyebrow">Pickup</p>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className={labelClass}>Address line 1 *</span>
              <input
                required
                value={pickupLine1}
                onChange={(e) => setPickupLine1(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Address line 2</span>
              <input
                value={pickupLine2}
                onChange={(e) => setPickupLine2(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>City</span>
              <input
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Postcode *</span>
              <input
                required
                value={pickupPostcode}
                onChange={(e) => setPickupPostcode(e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>
        </div>
        <div>
          <p className="vb-eyebrow">Drop-off</p>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className={labelClass}>Address line 1 *</span>
              <input
                required
                value={dropoffLine1}
                onChange={(e) => setDropoffLine1(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Address line 2</span>
              <input
                value={dropoffLine2}
                onChange={(e) => setDropoffLine2(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>City</span>
              <input
                value={dropoffCity}
                onChange={(e) => setDropoffCity(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Postcode *</span>
              <input
                required
                value={dropoffPostcode}
                onChange={(e) => setDropoffPostcode(e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>
        </div>
      </div>

      <label className="block sm:col-span-2">
        <span className={labelClass}>Preferred window</span>
        <input
          value={preferredWindow}
          onChange={(e) => setPreferredWindow(e.target.value)}
          placeholder="e.g. Before 2pm today"
          className={fieldClass}
        />
      </label>
      </>
      )}

      {step === 2 && (
      <div>
        <p className="vb-eyebrow">Contact</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Full name *</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Email *</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Phone / WhatsApp</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      </div>
      )}

      {error && (
        <p className="border border-vb-danger/30 bg-vb-danger/5 px-4 py-3 text-sm text-vb-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep((n) => n - 1);
            }}
            className="inline-flex h-11 items-center border border-vb-line px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-ink"
          >
            Back
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            onClick={continueStep}
            disabled={uploading}
            className="inline-flex h-11 items-center bg-vb-ink px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper disabled:opacity-60"
          >
            Continue
          </button>
        ) : (
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex h-11 items-center bg-vb-accent px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Request delivery"
          )}
        </button>
        )}
        {waLive && (
          <a
            href={whatsappHref(
              "Hi Vivaboss — I need a courier. Pickup:  Drop-off:  Item: "
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-vb-ink hover:text-vb-paper"
          >
            Or WhatsApp
          </a>
        )}
      </div>
    </form>
  );
}
