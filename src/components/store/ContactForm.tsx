"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { contactTopics } from "@/lib/content/marketing";

const fieldClass =
  "mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm";
const labelClass =
  "font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted";

export default function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<string>(contactTopics[0].value);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, topic, message }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not send message.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="border border-vb-line bg-vb-white p-8">
        <p className="vb-eyebrow text-vb-accent">Sent</p>
        <h2 className="mt-3 font-heading text-xl font-bold uppercase tracking-tight">
          We’ve got your message
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-vb-muted">
          Thanks — we’ll reply by email as soon as we can. For bookings, you can
          also use the service or courier forms for a faster ops queue.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 border border-vb-line bg-vb-white p-6 sm:p-8"
    >
      <div>
        <p className="vb-eyebrow">Message</p>
        <h2 className="mt-2 font-heading text-xl font-bold uppercase tracking-tight">
          Write to Vivaboss
        </h2>
      </div>

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
      <label className="block">
        <span className={labelClass}>Phone</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Topic *</span>
        <select
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={fieldClass}
        >
          {contactTopics.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Message *</span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={fieldClass}
        />
      </label>

      {error && (
        <p className="border border-vb-danger/30 bg-vb-danger/5 px-4 py-3 text-sm text-vb-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 items-center bg-vb-accent px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}
