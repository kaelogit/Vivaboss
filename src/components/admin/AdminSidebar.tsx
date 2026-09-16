"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { useAdminNav } from "@/components/admin/AdminNavContext";
import { adminNav } from "@/lib/admin-nav";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function AdminSidebar({
  email,
  onNavigate,
}: {
  email: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { pendingHref, isPending, navigate } = useAdminNav();

  const go = (href: string) => {
    onNavigate?.();
    navigate(href);
  };

  return (
    <aside className="relative flex h-full min-h-screen w-64 shrink-0 flex-col border-r border-vb-line bg-vb-white">
      {(isPending || pendingHref) && (
        <div
          className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-vb-mist"
          aria-hidden
        >
          <div className="h-full w-1/2 animate-[vb-admin-indeterminate_1s_ease-in-out_infinite] bg-vb-accent" />
        </div>
      )}

      <div className="border-b border-vb-line px-5 py-6">
        <button
          type="button"
          onClick={() => go("/admin")}
          className="block w-full text-left"
        >
          <span className="font-heading text-xl font-extrabold uppercase tracking-tight text-vb-ink">
            {siteConfig.shortName}
          </span>
          <span className="mt-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-vb-muted">
            Admin
          </span>
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {adminNav.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-vb-muted">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);
                const pending = pendingHref === href && isPending;
                return (
                  <li key={href}>
                    <button
                      type="button"
                      onClick={() => go(href)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left font-heading text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                        active
                          ? "bg-vb-ink text-vb-paper"
                          : pending
                            ? "bg-vb-mist text-vb-ink"
                            : "text-vb-muted hover:bg-vb-mist hover:text-vb-ink"
                      )}
                    >
                      {pending ? (
                        <Loader2
                          size={15}
                          strokeWidth={1.75}
                          className="animate-spin"
                        />
                      ) : (
                        <Icon size={15} strokeWidth={1.75} />
                      )}
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-vb-line p-4">
        <p className="truncate px-2 text-xs text-vb-muted">{email}</p>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-2 py-2 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted transition-colors hover:text-vb-ink"
        >
          <ExternalLink size={14} />
          View site
        </Link>
        <AdminSignOutButton />
      </div>
    </aside>
  );
}
