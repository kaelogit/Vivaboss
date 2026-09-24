import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { footerColumns, whatsappHref } from "@/lib/navigation";
import {
  getPublicContact,
  isPlaceholderAddress,
} from "@/lib/content/siteSettings";

export default async function SiteFooter() {
  const year = new Date().getFullYear();
  const contact = await getPublicContact();
  const address = contact.address.trim();

  return (
    <footer className="mt-auto border-t border-vb-line bg-vb-ink text-vb-paper">
      <div className="vb-container py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label={`${siteConfig.name} home`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-mark.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0"
              />
              <span className="font-heading text-xl font-bold uppercase tracking-tight text-vb-paper sm:text-2xl">
                Vivaboss Fusion
              </span>
            </Link>
            <p className="mt-2 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-vb-accent">
              {siteConfig.homepageLine}
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
              {siteConfig.tagline}
            </p>
            <p className="mt-3 max-w-sm font-heading text-sm font-semibold leading-snug text-vb-paper sm:text-base">
              {siteConfig.fashionPunchline}
            </p>
            <div className="mt-8 space-y-2 text-sm text-white/65">
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="block transition-colors hover:text-white"
              >
                {siteConfig.contact.email}
              </a>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="block transition-colors hover:text-white"
              >
                {siteConfig.contact.phone}
              </a>
              <p>
                {isPlaceholderAddress(address)
                  ? "Serving the United Kingdom"
                  : address}
              </p>
            </div>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-11 items-center bg-vb-accent px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-vb-accent-hover"
            >
              WhatsApp us
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="font-heading uppercase tracking-[0.16em]">
            {siteConfig.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
