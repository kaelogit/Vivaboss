"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { SERVICE_JOB_TYPES } from "@/lib/bookings/labels";
import { whatsappHref } from "@/lib/navigation";
import { isWhatsAppLive } from "@/lib/site";
import type { ServiceJobType } from "@/types/database";

const fieldClass =
  "mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm";
const labelClass =
  "font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted";

export default function ServiceBookingForm({
  initialType = "home_repair",
}: {
  initialType?: ServiceJobType;
}) {
  const [jobType, setJobType] = useState<ServiceJobType>(initialType);
  const [specificService, setSpecificService] = useState("");
  const [description, setDescription] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [preferredWindow, setPreferredWindow] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  const waLive = isWhatsAppLive();
  const waMessage = useMemo(
    () =>
      `Hi Vivaboss — I submitted a service booking (${jobType.replace(/_/g, " ")}). Postcode: ${postcode || "—"}. Name: ${fullName || "—"}.`,
    [jobType, postcode, fullName]
  );

  // paths only — durable in DB
  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const paths: string[] = [];
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
        paths.push(data.path);
      }
      setPhotos((prev) => [...prev, ...paths].slice(0, 6));
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
      const res = await fetch("/api/service-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType,
          specificService,
          description,
          photos,
          addressLine1,
          addressLine2,
          city,
          postcode,
          preferredWindow,
          fullName,
          email,
          phone,
          whatsapp: phone,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        throw new Error(data.error ?? "Could not submit booking.");
      }
      setDoneId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (doneId) {
    return (
      <div className="border border-vb-line bg-vb-white p-8 sm:p-10">
        <p className="vb-eyebrow text-vb-accent">Submitted</p>
        <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight">
          We’ve got your booking
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-vb-muted">
          Thanks — your request is with the team. We’ll email confirmation and
          follow up about timing
          {postcode ? ` for ${postcode.toUpperCase()}` : ""}.
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

  return (
    <form
      onSubmit={submit}
      className="space-y-8 border border-vb-line bg-vb-white p-6 sm:p-10"
    >
      <div>
        <p className="vb-eyebrow">Details</p>
        <h2 className="mt-2 font-heading text-xl font-bold uppercase tracking-tight">
          What do you need?
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClass}>Service type</span>
          <select
            required
            value={jobType}
            onChange={(e) => setJobType(e.target.value as ServiceJobType)}
            className={fieldClass}
          >
            {SERVICE_JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Specific service (optional)</span>
          <input
            value={specificService}
            onChange={(e) => setSpecificService(e.target.value)}
            placeholder="e.g. Smart lock install, bathroom tap repair"
            className={fieldClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Describe the job</span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass}
            placeholder="What’s wrong, access notes, materials on site…"
          />
        </label>
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
            {uploading ? " · uploading…" : ""}
          </p>
        )}
      </div>

      <div>
        <p className="vb-eyebrow">Location</p>
        <h2 className="mt-2 font-heading text-xl font-bold uppercase tracking-tight">
          Where should we attend?
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>Address line 1</span>
            <input
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Address line 2</span>
            <input
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>City / town</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Postcode *</span>
            <input
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Preferred window</span>
            <input
              value={preferredWindow}
              onChange={(e) => setPreferredWindow(e.target.value)}
              placeholder="e.g. Weekday mornings, Sat AM"
              className={fieldClass}
            />
          </label>
        </div>
      </div>

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

      {error && (
        <p className="border border-vb-danger/30 bg-vb-danger/5 px-4 py-3 text-sm text-vb-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
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
            "Submit booking"
          )}
        </button>
        {waLive && (
          <a
            href={whatsappHref(
              `Hi Vivaboss — I'd like to book a service. My postcode is: ${postcode || ""}`
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
