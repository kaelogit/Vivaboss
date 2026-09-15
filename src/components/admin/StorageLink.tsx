"use client";

import { useEffect, useState } from "react";
import { isCustomerUploadPath } from "@/lib/storage/customerUploads";

/** Resolves storage paths to fresh signed URLs for admin viewing. */
export default function StorageLink({
  pathOrUrl,
  label = "View file",
  className,
  asImage,
}: {
  pathOrUrl: string;
  label?: string;
  className?: string;
  asImage?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(
    pathOrUrl.startsWith("http") ? pathOrUrl : null
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pathOrUrl.startsWith("http")) {
      setUrl(pathOrUrl);
      return;
    }
    if (!isCustomerUploadPath(pathOrUrl)) {
      setError(true);
      return;
    }
    let cancelled = false;
    fetch("/api/admin/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathOrUrl }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { url?: string };
        if (!cancelled) {
          if (data.url) setUrl(data.url);
          else setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathOrUrl]);

  if (error) {
    return <span className="text-xs text-vb-muted">File unavailable</span>;
  }
  if (!url) {
    return <span className="text-xs text-vb-muted">Loading…</span>;
  }

  if (asImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="h-full w-full object-cover" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={className ?? "text-vb-accent"}
    >
      {label}
    </a>
  );
}
