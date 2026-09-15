"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const shots = images.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  const current = shots[active];

  if (!current) {
    return (
      <div className="flex aspect-[4/5] items-end bg-vb-mist p-6">
        <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
          Photography coming soon
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-vb-mist">
        <Image
          src={current}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
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
    </div>
  );
}
