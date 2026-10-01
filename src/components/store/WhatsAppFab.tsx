"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { whatsappHref } from "@/lib/navigation";
import { isWhatsAppLive } from "@/lib/site";
import { cn } from "@/lib/utils";

const OPEN_DELAY_MS = 1800;
const AUTO_HIDE_MS = 9000;
const RETURN_MS = 3 * 60 * 1000;
const MESSAGE = "Hi Vivaboss — I'd like some help.";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2zm0 1.67c4.52 0 8.24 3.72 8.24 8.24 0 4.52-3.72 8.24-8.24 8.24-1.44 0-2.84-.37-4.07-1.08l-.29-.17-3.11.82.83-3.04-.19-.31a8.2 8.2 0 0 1-1.26-4.46c0-4.52 3.72-8.24 8.09-8.24zm4.52 10.72c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74 2.49 1.08 2.49.72 2.94.67.45-.05 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29z" />
    </svg>
  );
}

export default function WhatsAppFab() {
  const live = isWhatsAppLive();
  const [bubble, setBubble] = useState(false);
  const [ready, setReady] = useState(false);
  const hideId = useRef(0);
  const returnId = useRef(0);
  const api = useRef<{
    show: () => void;
    hide: () => void;
  } | null>(null);

  useEffect(() => {
    if (!live) return;

    function hide() {
      setBubble(false);
      window.clearTimeout(hideId.current);
      window.clearTimeout(returnId.current);
      returnId.current = window.setTimeout(() => {
        show();
      }, RETURN_MS);
    }

    function show() {
      setReady(true);
      setBubble(true);
      window.clearTimeout(hideId.current);
      hideId.current = window.setTimeout(() => {
        hide();
      }, AUTO_HIDE_MS);
    }

    api.current = { show, hide };
    const openId = window.setTimeout(show, OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(openId);
      window.clearTimeout(hideId.current);
      window.clearTimeout(returnId.current);
      api.current = null;
    };
  }, [live]);

  if (!live) return null;

  const href = whatsappHref(MESSAGE);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      <div
        className={cn(
          "pointer-events-auto w-[min(18.5rem,calc(100vw-2.5rem))] origin-bottom-right border border-vb-line bg-vb-white p-4 shadow-[0_20px_50px_-24px_rgba(18,17,16,0.45)] transition-all duration-500 ease-out",
          bubble
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible translate-y-3 scale-95 opacity-0"
        )}
        role="dialog"
        aria-label="Chat with Vivaboss on WhatsApp"
        aria-hidden={!bubble}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-accent">
              WhatsApp
            </p>
            <p className="mt-2 font-heading text-sm font-bold uppercase tracking-tight text-vb-ink">
              Reach out to us
            </p>
          </div>
          <button
            type="button"
            onClick={() => api.current?.hide()}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-vb-muted hover:text-vb-ink"
            aria-label="Close message"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-vb-muted">
          Questions about an order, a custom piece, a home visit, or a courier
          run — we’re on WhatsApp.
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-10 w-full items-center justify-center bg-vb-accent font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-vb-accent-hover"
        >
          Chat now
        </a>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className={cn(
          "pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-vb-accent text-white shadow-[0_14px_40px_-14px_rgba(180,83,42,0.75)] transition-all duration-300 hover:scale-105 hover:bg-vb-accent-hover",
          ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  );
}
