import type {
  CourierJobStatus,
  CourierUrgency,
  CourierVertical,
  ServiceJobStatus,
  ServiceJobType,
} from "@/types/database";

export const SERVICE_JOB_TYPES: { value: ServiceJobType; label: string }[] = [
  { value: "home_repair", label: "Home repair / improvement" },
  { value: "smart_home_install", label: "Smart home installation" },
  { value: "other", label: "Other / not sure" },
];

export const SERVICE_JOB_STATUSES: ServiceJobStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

export const COURIER_VERTICALS: { value: CourierVertical; label: string }[] = [
  { value: "medical", label: "Medical" },
  { value: "legal", label: "Legal" },
  { value: "flowers_events", label: "Flowers & events" },
  { value: "general", label: "General" },
];

export const COURIER_URGENCIES: { value: CourierUrgency; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "same_day", label: "Same day" },
  { value: "urgent", label: "Urgent" },
];

export const COURIER_JOB_STATUSES: CourierJobStatus[] = [
  "new",
  "confirmed",
  "picked_up",
  "delivered",
  "failed",
  "cancelled",
];

export function labelServiceType(value: ServiceJobType) {
  return SERVICE_JOB_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function labelCourierVertical(value: CourierVertical) {
  return COURIER_VERTICALS.find((t) => t.value === value)?.label ?? value;
}

export function labelCourierUrgency(value: CourierUrgency) {
  return COURIER_URGENCIES.find((t) => t.value === value)?.label ?? value;
}

export function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}
