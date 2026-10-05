import type { ReviewServiceType } from "@/types/database";

export type { ReviewServiceType };

export const REVIEW_SERVICE_TYPES: {
  value: ReviewServiceType;
  label: string;
  shortLabel: string;
}[] = [
  {
    value: "home_repair",
    label: "Home services",
    shortLabel: "Home services",
  },
  {
    value: "smart_home_install",
    label: "Smart home services",
    shortLabel: "Smart home",
  },
];

export function isReviewServiceType(value: unknown): value is ReviewServiceType {
  return value === "home_repair" || value === "smart_home_install";
}

export function labelReviewServiceType(value: ReviewServiceType | null | undefined) {
  if (!value) return null;
  return (
    REVIEW_SERVICE_TYPES.find((t) => t.value === value)?.label ?? value
  );
}

export function reviewScopeLabel(input: {
  productName?: string | null;
  productId?: string | null;
  serviceType?: ReviewServiceType | null;
}): string {
  if (input.productName?.trim()) return input.productName.trim();
  if (input.productId) return "Product";
  const service = labelReviewServiceType(input.serviceType);
  if (service) return service;
  return "Site";
}
