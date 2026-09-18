import { Resend } from "resend";
import {
  defaultNotifications,
  parseNotifications,
  type NotificationsSettings,
} from "@/lib/content/siteSettings";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

/** Always notified on orders, bookings, custom requests, and contact. */
export const DEFAULT_ADMIN_EMAIL = "admin@vivabossfusion.co.uk";

export type AdminNotifyKind =
  | "order"
  | "service"
  | "courier"
  | "custom"
  | "contact";

export function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("Missing RESEND_API_KEY");
  return new Resend(key);
}

export type EmailFromKind =
  | "order"
  | "booking"
  | "courier"
  | "custom"
  | "contact"
  | "default";

const FROM_DEFAULTS: Record<EmailFromKind, string> = {
  order: "Vivaboss Orders <order@vivabossfusion.co.uk>",
  booking: "Vivaboss Bookings <booking@vivabossfusion.co.uk>",
  courier: "Vivaboss Courier <courier@vivabossfusion.co.uk>",
  custom: "Vivaboss Custom <custom@vivabossfusion.co.uk>",
  contact: "Vivaboss <hello@vivabossfusion.co.uk>",
  default: "Vivaboss Fusion <hello@vivabossfusion.co.uk>",
};

/**
 * From address per mail stream. Override any with RESEND_FROM_ORDER etc.
 * Typed kinds use the defaults below (not RESEND_FROM_EMAIL), so a leftover
 * single From env won’t collapse everything onto one mailbox.
 */
export function emailFrom(kind: EmailFromKind = "default") {
  const envKey =
    kind === "order"
      ? "RESEND_FROM_ORDER"
      : kind === "booking"
        ? "RESEND_FROM_BOOKING"
        : kind === "courier"
          ? "RESEND_FROM_COURIER"
          : kind === "custom"
            ? "RESEND_FROM_CUSTOM"
            : kind === "contact"
              ? "RESEND_FROM_CONTACT"
              : null;

  const specific = envKey ? process.env[envKey]?.trim() : undefined;
  if (specific) return specific;

  if (kind === "default") {
    return (
      process.env.RESEND_FROM_EMAIL?.trim() || FROM_DEFAULTS.default
    );
  }

  return FROM_DEFAULTS[kind];
}

/** Customer “Reply” goes here on outbound mail. */
export function emailReplyTo() {
  return (
    process.env.RESEND_REPLY_TO?.trim() ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    DEFAULT_ADMIN_EMAIL
  );
}

function envAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "";

  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Sync fallback (env + default only). Prefer `resolveAdminNotifyEmails()`.
 */
export function adminNotifyEmails(): string[] {
  const set = new Set<string>([
    DEFAULT_ADMIN_EMAIL.toLowerCase(),
    ...envAdminEmails(),
  ]);
  return Array.from(set);
}

async function loadNotifications(): Promise<NotificationsSettings> {
  if (!hasAdminClient()) return defaultNotifications();
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "notifications")
      .maybeSingle();
    return parseNotifications(data?.value ?? null);
  } catch {
    return defaultNotifications();
  }
}

/** Admin inboxes: Settings adminEmails + env + hardcoded default. */
export async function resolveAdminNotifyEmails(): Promise<string[]> {
  const settings = await loadNotifications();
  const fromSettings = (settings.adminEmails ?? [])
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const set = new Set<string>([
    DEFAULT_ADMIN_EMAIL.toLowerCase(),
    ...envAdminEmails(),
    ...fromSettings,
  ]);
  return Array.from(set);
}

/** Respect Settings notification toggles (contact always on). */
export async function shouldNotifyAdmin(
  kind: AdminNotifyKind
): Promise<boolean> {
  if (kind === "contact") return true;
  const settings = await loadNotifications();
  switch (kind) {
    case "order":
      return settings.emailOnOrder;
    case "service":
      return settings.emailOnServiceJob;
    case "courier":
      return settings.emailOnCourierJob;
    case "custom":
      return settings.emailOnCustomRequest;
    default:
      return true;
  }
}

/** Resolve recipients only when the toggle for this kind is on. */
export async function adminEmailsFor(
  kind: AdminNotifyKind
): Promise<string[]> {
  if (!(await shouldNotifyAdmin(kind))) return [];
  return resolveAdminNotifyEmails();
}
