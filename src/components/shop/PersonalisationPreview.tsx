import type { CustomFieldOption } from "@/types/database";
import type { ProductDetail } from "@/lib/products/queries";

function zoneText(
  field: ProductDetail["custom_fields"][number],
  value: string
) {
  const raw = value.trim();
  if (!raw) return field.preview_caption?.trim() || "Your text";
  if (field.field_type === "select" || field.field_type === "colour") {
    const opt = (field.options as CustomFieldOption[]).find((o) => o.value === raw);
    return opt?.label ?? raw;
  }
  return raw;
}

function zoneColour(
  field: ProductDetail["custom_fields"][number],
  value: string
) {
  if (field.field_type !== "colour") return null;
  const opt = (field.options as CustomFieldOption[]).find(
    (o) => o.value === value.trim()
  );
  return opt?.colour_hex ?? null;
}

export default function PersonalisationPreview({
  product,
  values,
  files,
}: {
  product: ProductDetail;
  values: Record<string, string>;
  files: Record<string, { url: string; path: string }>;
}) {
  const zones = product.custom_fields.filter(
    (field) =>
      field.show_on_preview &&
      field.preview_w != null &&
      field.preview_h != null &&
      Number(field.preview_w) > 0 &&
      Number(field.preview_h) > 0
  );
  const images = product.images ?? [];
  const sides = [...new Set(zones.map((field) => field.preview_image_index ?? 0))]
    .filter((index) => images[index])
    .sort((a, b) => a - b);
  if (sides.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
        Preview
      </p>
      {sides.map((side) => {
        const photo = images[side];
        const sideZones = zones.filter(
          (field) => (field.preview_image_index ?? 0) === side
        );
        return (
          <div key={side}>
            {sides.length > 1 && (
              <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-ink">
                {sideZones
                  .map((field) => field.preview_caption?.trim())
                  .filter(Boolean)
                  .filter((name, i, all) => all.indexOf(name) === i)
                  .join(" · ") || `Photo ${side + 1}`}
              </p>
            )}
            <div className="relative aspect-[4/5] overflow-hidden bg-vb-mist">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="h-full w-full object-cover" />
              {sideZones.map((field) => {
                const value = values[field.key] ?? "";
                const fileUrl = files[field.key]?.url;
                const tint = zoneColour(field, value);
                const number = zones.indexOf(field) + 1;
                return (
                  <div
                    key={field.id}
                    className="absolute overflow-hidden border-2 border-white bg-black/20"
                    style={{
                      left: `${field.preview_x}%`,
                      top: `${field.preview_y}%`,
                      width: `${field.preview_w}%`,
                      height: `${field.preview_h}%`,
                      backgroundColor: tint ?? undefined,
                    }}
                  >
                    {field.field_type === "file" && fileUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fileUrl}
                        alt=""
                        className={`h-full w-full ${
                          field.preview_fit === "contain"
                            ? "object-contain"
                            : "object-cover"
                        }`}
                      />
                    ) : field.field_type !== "file" ? (
                      <p
                        className={`flex h-full items-center justify-center px-1 text-center font-semibold leading-tight ${
                          field.preview_ink === "dark" ? "text-vb-ink" : "text-white"
                        }`}
                        style={zoneType(field)}
                      >
                        {zoneText(field, value)}
                      </p>
                    ) : (
                      <p className="flex h-full items-center justify-center px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
                        {field.preview_caption?.trim() || field.label}
                      </p>
                    )}
                    <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center bg-vb-accent font-heading text-[10px] font-bold text-white">
                      {number}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function zoneType(field: ProductDetail["custom_fields"][number]) {
  const fontFamily =
    field.preview_font === "script"
      ? '"Segoe Script","Brush Script MT",cursive'
      : field.preview_font === "serif"
        ? "Georgia, 'Times New Roman', serif"
        : "inherit";
  const fontSize =
    field.preview_size === "lg"
      ? "1.35rem"
      : field.preview_size === "sm"
        ? "0.7rem"
        : "0.95rem";
  return { fontFamily, fontSize };
}
