"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
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

  return (
    <aside className="flex h-full min-h-screen w-64 shrink-0 flex-col border-r border-vb-line bg-vb-white">
      <div className="border-b border-vb-line px-5 py-6">
        <Link href="/admin" onClick={onNavigate} className="block">
          <span className="font-heading text-xl font-extrabold uppercase tracking-tight text-vb-ink">
            {siteConfig.shortName}
          </span>
          <span className="mt-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-vb-muted">
            Admin
          </span>
        </Link>
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
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                        active
                          ? "bg-vb-ink text-vb-paper"
                          : "text-vb-muted hover:bg-vb-mist hover:text-vb-ink"
                      )}
                    >
                      <Icon size={15} strokeWidth={1.75} />
                      {label}
                    </Link>
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
