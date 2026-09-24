"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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

function NavSearch({
  id,
  onDone,
  className,
}: {
  id: string;
  onDone?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        router.push(
          query
            ? `/shop?q=${encodeURIComponent(query)}#shop-results`
            : "/shop#shop-results"
        );
        onDone?.();
      }}
    >
      <label className="sr-only" htmlFor={id}>
        Search products
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="h-9 w-full border border-vb-line bg-vb-paper px-3 text-sm text-vb-ink placeholder:text-vb-muted lg:w-36"
      />
    </form>
  );
}

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
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const pendingFocus = useRef<number | null>(null);

  useEffect(() => {
    if (!open || pendingFocus.current == null) return;
    const index = pendingFocus.current;
    pendingFocus.current = null;
    const items =
      rootRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-item]");
    items?.[index]?.focus();
  }, [open]);

  function itemLinks() {
    return Array.from(
      rootRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-item]") ??
        []
    );
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      if (!open) return;
      e.preventDefault();
      onClose();
      rootRef.current
        ?.querySelector<HTMLAnchorElement>("[data-nav-trigger]")
        ?.focus();
      return;
    }

    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();

    const items = itemLinks();
    const trigger = rootRef.current?.querySelector<HTMLAnchorElement>(
      "[data-nav-trigger]"
    );
    const itemIndex = items.findIndex((el) => el === document.activeElement);

    if (e.key === "ArrowDown") {
      if (!open) {
        pendingFocus.current = 0;
        onOpen();
        return;
      }
      if (document.activeElement === trigger) {
        items[0]?.focus();
        return;
      }
      if (itemIndex >= 0 && itemIndex < items.length - 1) {
        items[itemIndex + 1]?.focus();
      }
      return;
    }

    if (itemIndex <= 0) {
      trigger?.focus();
      return;
    }
    items[itemIndex - 1]?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={(e) => {
        if (!e.currentTarget.contains(document.activeElement)) onClose();
      }}
      onFocus={onOpen}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <Link
        href={href}
        data-nav-trigger
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        className={cn(
          "inline-flex items-center px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
          active ? "text-vb-accent" : "text-vb-ink/80 hover:text-vb-ink"
        )}
      >
        {label}
      </Link>
      <div
        id={panelId}
        inert={!open}
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
            data-nav-item
            className="block border-b border-vb-line px-3 py-2.5 font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-accent hover:text-vb-accent-hover"
          >
            {overviewLabel}
          </Link>
          <ul className="mt-1">
            {links.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  data-nav-item
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
  const mobileRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuKey>(null);
  const waLive = isWhatsAppLive();

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  // iOS-safe lock: overflow:hidden alone still lets the page scroll under sticky nav
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
    };

    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";

    return () => {
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = mobileRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
    focusable()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
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
    <>
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
          <NavSearch id="nav-search" className="hidden lg:block" />
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
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>

      {/* Full-viewport overlay (T40 pattern) — X lives here so page scroll can't hide it */}
      {open && (
        <div
          ref={mobileRef}
          className="fixed inset-0 z-[100] flex flex-col bg-vb-white lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-vb-line px-5 sm:h-16 sm:px-8">
            <Link
              href="/"
              className="flex shrink-0 items-center"
              aria-label={`${siteConfig.shortName} home`}
              onClick={() => setOpen(false)}
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
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center text-vb-ink"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X size={22} strokeWidth={1.75} />
            </button>
          </div>

          <nav
            className="vb-container flex-1 space-y-1 overflow-y-auto overscroll-contain py-6"
            aria-label="Mobile"
          >
            <NavSearch
              id="nav-search-mobile"
              className="mb-6"
              onDone={() => setOpen(false)}
            />
            {primaryNav.map((item) => {
              const children = mobileChildren(item.href);
              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
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
                            onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
              >
                Chat on WhatsApp
              </a>
            ) : (
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-4 flex h-12 items-center justify-center bg-vb-ink font-heading text-xs font-semibold uppercase tracking-[0.18em] text-vb-paper"
              >
                Contact us
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
