import { isWhatsAppLive } from "@/lib/site";
import { whatsappHref } from "@/lib/navigation";

/** Mobile-only WhatsApp shortcut — hidden until a real number is configured. */
export default function WhatsAppFab() {
  if (!isWhatsAppLive()) return null;

  return (
    <a
      href={whatsappHref("Hi Vivaboss — I'd like some help.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 bg-vb-accent px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_40px_-12px_rgba(180,83,42,0.7)] transition-colors hover:bg-vb-accent-hover sm:bottom-8 sm:right-8 md:hidden"
      aria-label="Chat on WhatsApp"
    >
      WhatsApp
    </a>
  );
}
