"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ProductPhotoFallback from "@/components/shop/ProductPhotoFallback";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const shots = images.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const startX = useRef<number | null>(null);
  const current = shots[active];

  useEffect(() => {
    if (!zoom) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom, shots.length]);

  function go(delta: number) {
    setActive((i) => (i + delta + shots.length) % shots.length);
  }

  if (!current) {
    return (
      <div className="aspect-[4/5] overflow-hidden bg-vb-mist">
        <ProductPhotoFallback name={name} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/5] touch-pan-y overflow-hidden bg-vb-mist"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          if (e.pointerType === "mouse" && e.button !== 0) return;
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current == null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (shots.length < 2 || Math.abs(dx) < 12) setZoom(true);
          else if (dx > 48) go(-1);
          else if (dx < -48) go(1);
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
      >
        <Image
          src={current}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          draggable={false}
        />
        <span className="pointer-events-none absolute bottom-3 left-3 bg-vb-paper/90 px-2.5 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-ink">
          View larger
        </span>
        {shots.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-vb-paper/90 text-vb-ink"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-vb-paper/90 text-vb-ink"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>
      {shots.length > 1 && (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {shots.slice(0, 8).map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative aspect-square w-full overflow-hidden bg-vb-mist ${
                  i === active
                    ? "ring-2 ring-vb-accent ring-offset-2 ring-offset-vb-paper"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
      {zoom && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-vb-ink/92 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo`}
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            aria-label="Close photo"
            onClick={() => setZoom(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center bg-vb-paper text-vb-ink"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
          <div
            className="relative h-[min(86vh,920px)] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current}
              alt={name}
              fill
              sizes="100vw"
              className="object-contain"
              draggable={false}
            />
          </div>
          {shots.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-vb-paper text-vb-ink sm:left-6"
              >
                <ChevronLeft size={18} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-vb-paper text-vb-ink sm:right-6"
              >
                <ChevronRight size={18} strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
