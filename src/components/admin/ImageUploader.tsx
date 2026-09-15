"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
};

export default function ImageUploader({ images, onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);

    const remaining = max - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} images.`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
        if (data.url) newUrls.push(data.url);
      }
      onChange([...images, ...newUrls].slice(0, max));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((url, i) => (
          <div
            key={url}
            className="relative aspect-square border border-vb-line bg-vb-mist"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 bg-vb-ink/80 p-1 text-white hover:bg-vb-ink"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-vb-ink px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase tracking-wider text-white">
                Cover
              </span>
            )}
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-vb-line text-vb-muted transition-colors hover:border-vb-ink hover:text-vb-ink disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Upload size={20} />
                <span className="font-heading text-[9px] font-bold uppercase tracking-widest">
                  Upload
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />

      <p className="text-[11px] text-vb-muted">
        Up to {max} images · JPEG, PNG, WebP · Max 8MB · First image is the cover
      </p>
      {error && <p className="text-xs text-vb-danger">{error}</p>}
    </div>
  );
}
