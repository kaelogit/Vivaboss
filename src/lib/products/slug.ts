export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function fieldKeyFromLabel(label: string): string {
  return nameToSlug(label).replace(/-/g, "_").slice(0, 40) || "field";
}
