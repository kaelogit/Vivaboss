import { Resend } from "resend";

/** Always notified on orders, bookings, custom requests, and contact. */
export const DEFAULT_ADMIN_EMAIL = "admin@vivabossfusion.co.uk";

export function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("Missing RESEND_API_KEY");
  return new Resend(key);
}

export function emailFrom() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Vivaboss Fusion <onboarding@resend.dev>"
  );
}

/**
 * Admin inboxes for every operational email.
 * Always includes admin@vivabossfusion.co.uk; env can add more (comma-separated).
 */
export function adminNotifyEmails(): string[] {
  const raw =
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "";

  const fromEnv = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const set = new Set<string>([DEFAULT_ADMIN_EMAIL.toLowerCase(), ...fromEnv]);
  return Array.from(set);
}
