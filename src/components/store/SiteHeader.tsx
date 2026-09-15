"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig, isWhatsAppLive } from "@/lib/site";
import {
  courierNavLinks,
  primaryNav,
  servicesNavLinks,
  shopCategories,
  whatsappHref,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { CartLink } from "@/components/store/CartBadge";

type MenuKey = "shop" | "services" | "courier" | null;

type DropdownLink = {
  label: string;
  blurb: string;
  href: string;
};

function NavDropdown({
  label,
  href,
  open,
  onOpen,
  onClose,
  active,
  overviewLabel,
  links,
}: {
  label: string;
  href: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  active: boolean;
  overviewLabel: string;
  links: readonly DropdownLink[];
}) {
  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
          active ? "text-vb-accent" : "text-vb-ink/80 hover:text-vb-ink"
        )}
      >
        {label}
      </Link>
      <div
        className={cn(
          "absolute left-0 top-full w-[22rem] pt-2 transition-all",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        )}
      >
        <div className="border border-vb-line bg-vb-white p-3 shadow-[0_20px_50px_-28px_rgba(18,17,16,0.45)]">
          <Link
            href={href}
            className="block border-b border-vb-line px-3 py-2.5 font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-accent hover:text-vb-accent-hover"
          >
            {overviewLabel}
          </Link>
          <ul className="mt-1">
            {links.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="block px-3 py-2.5 transition-colors hover:bg-vb-mist"
                >
                  <span className="font-heading text-sm font-semibold text-vb-accent">
                    {link.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-vb-accent/75">
                    {link.blurb}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuKey>(null);
  const waLive = isWhatsAppLive();

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const shopLinks: DropdownLink[] = shopCategories.map((cat) => ({
    label: cat.label,
    blurb: cat.blurb,
    href: cat.href,
  }));

  const serviceLinks: DropdownLink[] = servicesNavLinks.filter(
    (l) => l.href !== "/services"
  );

  const courierLinks: DropdownLink[] = courierNavLinks.filter(
    (l) => l.href !== "/courier"
  );

  const mobileChildren = (href: string): DropdownLink[] => {
    if (href === "/shop") return shopLinks;
    if (href === "/services") return [...serviceLinks];
    if (href === "/courier") return [...courierLinks];
    return [];
  };

  return (
    <header className="sticky top-0 z-50 border-b border-vb-line/80 bg-vb-white">
      <div className="vb-container flex h-14 items-center justify-between gap-4 sm:h-16">
        <Link
          href="/"
          className="group flex shrink-0 items-center"
          aria-label={`${siteConfig.shortName} home`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-nav.png"
            alt={siteConfig.shortName}
            width={220}
            height={52}
            className="h-11 w-auto sm:h-12"
          />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {primaryNav.map((item) => {
            if (item.href === "/shop") {
              return (
                <NavDropdown
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  open={menu === "shop"}
                  onOpen={() => setMenu("shop")}
                  onClose={() => setMenu(null)}
                  active={isActive("/shop")}
                  overviewLabel="All products"
                  links={shopLinks}
                />
              );
            }
            if (item.href === "/services") {
              return (
                <NavDropdown
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  open={menu === "services"}
                  onOpen={() => setMenu("services")}
                  onClose={() => setMenu(null)}
                  active={isActive("/services")}
                  overviewLabel="All services"
                  links={serviceLinks}
                />
              );
            }
            if (item.href === "/courier") {
              return (
                <NavDropdown
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  open={menu === "courier"}
                  onOpen={() => setMenu("courier")}
                  onClose={() => setMenu(null)}
                  active={isActive("/courier")}
                  overviewLabel="Courier overview"
                  links={courierLinks}
                />
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
                  isActive(item.href)
                    ? "text-vb-accent"
                    : "text-vb-ink/80 hover:text-vb-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {waLive && (
            <a
              href={whatsappHref(
                "Hi Vivaboss — I'd like to enquire about your services."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-ink/80 transition-colors hover:text-vb-accent md:inline-flex"
            >
              WhatsApp
            </a>
          )}

          <CartLink />

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center text-vb-ink lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X size={22} strokeWidth={1.75} />
            ) : (
              <Menu size={22} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-14 z-40 bg-vb-ink/40 transition-opacity lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <div
        className={cn(
          "fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-vb-line bg-vb-white transition-transform duration-300 lg:hidden",
          open ? "translate-y-0" : "-translate-y-[120%]"
        )}
      >
        <nav className="vb-container space-y-1 py-6" aria-label="Mobile">
          {primaryNav.map((item) => {
            const children = mobileChildren(item.href);
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block py-3 font-heading text-sm font-semibold uppercase tracking-[0.14em]",
                    isActive(item.href) ? "text-vb-accent" : "text-vb-ink"
                  )}
                >
                  {item.label}
                </Link>
                {children.length > 0 && (
                  <ul className="mb-2 ml-1 border-l border-vb-line pl-4">
                    {children.map((link) => (
                      <li key={link.href + link.label}>
                        <Link
                          href={link.href}
                          className="block py-2 text-sm text-vb-accent hover:text-vb-accent-hover"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {waLive ? (
            <a
              href={whatsappHref(
                "Hi Vivaboss — I'd like to enquire about your services."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-12 items-center justify-center bg-vb-accent font-heading text-xs font-semibold uppercase tracking-[0.18em] text-white"
            >
              Chat on WhatsApp
            </a>
          ) : (
            <Link
              href="/contact"
              className="mt-4 flex h-12 items-center justify-center bg-vb-ink font-heading text-xs font-semibold uppercase tracking-[0.18em] text-vb-paper"
            >
              Contact us
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
