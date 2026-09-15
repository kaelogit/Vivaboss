/** UK postcode helpers */

const UK_POSTCODE =
  /^([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i;

export function normalizeUkPostcode(raw: string): string {
  const compact = raw.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export function isValidUkPostcode(raw: string): boolean {
  const normalized = normalizeUkPostcode(raw);
  return UK_POSTCODE.test(normalized);
}

export function assertUkPostcode(raw: string): string {
  const normalized = normalizeUkPostcode(raw);
  if (!isValidUkPostcode(normalized)) {
    throw new Error("Enter a valid UK postcode.");
  }
  return normalized;
}

/** Outward code e.g. SW1A from SW1A 1AA */
export function postcodeOutward(raw: string): string {
  const n = normalizeUkPostcode(raw);
  return n.split(" ")[0] ?? n;
}
