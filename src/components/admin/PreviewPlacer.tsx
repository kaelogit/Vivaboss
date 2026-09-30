"use client";

import { useRef, useState } from "react";
import type { CustomFieldInput } from "@/lib/admin/productForm";

type Drag =
  | { mode: "draw"; index: number; x: number; y: number }
  | { mode: "move"; index: number; dx: number; dy: number }
  | { mode: "resize"; index: number };

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function point(e: React.PointerEvent, el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return {
    x: clamp(((e.clientX - rect.left) / rect.width) * 100),
    y: clamp(((e.clientY - rect.top) / rect.height) * 100),
  };
}

export default function PreviewPlacer({
  images,
  imageIndex,
  onImageIndex,
  fields,
  onChange,
  disabled,
}: {
  images: string[];
  imageIndex: number;
  onImageIndex: (index: number) => void;
  fields: CustomFieldInput[];
  onChange: (fields: CustomFieldInput[]) => void;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [active, setActive] = useState(0);
  const photo = images[Math.min(imageIndex, images.length - 1)] ?? images[0];

  const placed = fields
    .map((field, index) => ({ field, index }))
    .filter(
      ({ field }) =>
        field.show_on_preview &&
        (field.preview_image_index ?? 0) === imageIndex &&
        field.preview_w != null &&
        field.preview_h != null &&
        field.preview_w > 0 &&
        field.preview_h > 0
    );

  const update = (index: number, patch: Partial<CustomFieldInput>) => {
    onChange(fields.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !canvasRef.current) return;
    const target = e.target as HTMLElement;
    const zone = target.closest<HTMLElement>("[data-zone]");
    const handle = target.closest<HTMLElement>("[data-resize]");
    const p = point(e, canvasRef.current);
    if (handle && zone) {
      const index = Number(zone.dataset.zone);
      setActive(index);
      dragRef.current = { mode: "resize", index };
    } else if (zone) {
      const index = Number(zone.dataset.zone);
      const field = fields[index];
      setActive(index);
      dragRef.current = {
        mode: "move",
        index,
        dx: p.x - (field?.preview_x ?? 0),
        dy: p.y - (field?.preview_y ?? 0),
      };
    } else {
      const onThisPhoto = (index: number) => {
        const field = fields[index];
        return (
          Boolean(field?.show_on_preview) &&
          (field.preview_image_index ?? 0) === imageIndex
        );
      };
      const unplaced = fields.findIndex(
        (field) =>
          field.show_on_preview &&
          (field.preview_w == null || field.preview_w <= 0)
      );
      const chosen = onThisPhoto(active)
        ? active
        : unplaced >= 0
          ? unplaced
          : fields.findIndex((_, index) => onThisPhoto(index));
      if (chosen < 0) return;
      setActive(chosen);
      dragRef.current = { mode: "draw", index: chosen, x: p.x, y: p.y };
      update(chosen, {
        preview_image_index: imageIndex,
        preview_x: p.x,
        preview_y: p.y,
        preview_w: 1,
        preview_h: 1,
      });
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !canvasRef.current) return;
    const p = point(e, canvasRef.current);
    const field = fields[drag.index];
    if (!field) return;
    if (drag.mode === "draw") {
      const x = Math.min(drag.x, p.x);
      const y = Math.min(drag.y, p.y);
      update(drag.index, {
        preview_image_index: imageIndex,
        preview_x: x,
        preview_y: y,
        preview_w: Math.max(4, Math.abs(p.x - drag.x)),
        preview_h: Math.max(4, Math.abs(p.y - drag.y)),
      });
    } else if (drag.mode === "move") {
      const w = field.preview_w ?? 20;
      const h = field.preview_h ?? 16;
      update(drag.index, {
        preview_x: clamp(p.x - drag.dx, 0, 100 - w),
        preview_y: clamp(p.y - drag.dy, 0, 100 - h),
      });
    } else {
      update(drag.index, {
        preview_w: Math.max(4, p.x - (field.preview_x ?? 0)),
        preview_h: Math.max(4, p.y - (field.preview_y ?? 0)),
      });
    }
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  if (!photo) {
    return (
      <p className="text-sm text-vb-muted">
        Add a product photo first. Then you can mark where each answer appears.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
          Preview photo
        </p>
        {images.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                disabled={disabled}
                onClick={() => onImageIndex(i)}
                className={`h-14 w-14 overflow-hidden border ${
                  i === imageIndex ? "border-vb-accent" : "border-vb-line"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-vb-muted">
        Tick “Show on preview”, pick a photo, then drag a box. Switch photo to
        place the back, or any other side. Drag a box to move it, and the
        corner to resize it.
      </p>
      <div
        ref={canvasRef}
        className="relative aspect-[4/5] max-w-md touch-none select-none bg-vb-mist"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="h-full w-full object-cover" draggable={false} />
        {placed.map(({ field, index }, n) => (
          <div
            key={field.key + index}
            data-zone={index}
            className={`absolute border-2 bg-white/25 ${
              index === active ? "border-vb-accent" : "border-white"
            }`}
            style={{
              left: `${field.preview_x}%`,
              top: `${field.preview_y}%`,
              width: `${field.preview_w}%`,
              height: `${field.preview_h}%`,
            }}
          >
            <span className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center bg-vb-accent font-heading text-[10px] font-bold text-white">
              {n + 1}
            </span>
            <span className="block truncate px-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-vb-ink">
              {field.preview_caption.trim() || field.label}
            </span>
            <span
              data-resize
              className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-vb-ink"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
