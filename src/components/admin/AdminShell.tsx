"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  AdminNavProvider,
  useAdminNav,
  useAdminNavPending,
} from "@/components/admin/AdminNavContext";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { siteConfig } from "@/lib/site";

function formatBadge(n: number) {
  if (n <= 0) return null;
  return n > 99 ? "99+" : String(n);
}

function AdminMain({ children }: { children: React.ReactNode }) {
  const showPending = useAdminNavPending();
  return (
    <main className="relative min-w-0 flex-1 overflow-x-auto p-4 pt-16 lg:p-10 lg:pt-10">
      {showPending ? <AdminPageSkeleton withAction /> : children}
    </main>
  );
}

function MobileAdminHeader({ onOpen }: { onOpen: () => void }) {
  const { attentionTotal } = useAdminNav();
  const badge = formatBadge(attentionTotal);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-vb-line bg-vb-white px-4 py-3 lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        className="relative p-2 text-vb-ink"
        aria-label={
          badge
            ? `Open admin menu, ${attentionTotal} items need attention`
            : "Open admin menu"
        }
      >
        <Menu size={22} />
        {badge && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center bg-vb-accent px-1 py-0.5 font-heading text-[9px] font-bold tabular-nums text-white">
            {badge}
          </span>
        )}
      </button>
      <span className="font-heading text-sm font-bold uppercase tracking-tight">
        {siteConfig.shortName} Admin
      </span>
      <span className="w-9" aria-hidden />
    </header>
  );
}

function AdminShellInner({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-vb-mist">
      <MobileAdminHeader onOpen={() => setOpen(true)} />

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-vb-ink/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute right-3 top-3 z-10 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="border border-vb-line bg-vb-white p-2 text-vb-ink"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <AdminSidebar email={email} onNavigate={() => setOpen(false)} />
      </div>

      <AdminMain>{children}</AdminMain>
    </div>
  );
}

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <AdminNavProvider>
      <AdminShellInner email={email}>{children}</AdminShellInner>
    </AdminNavProvider>
  );
}
