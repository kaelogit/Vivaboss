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

export function emailFrom() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Vivaboss Fusion <onboarding@resend.dev>"
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
