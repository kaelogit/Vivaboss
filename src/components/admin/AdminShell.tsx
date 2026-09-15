"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { siteConfig } from "@/lib/site";

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-vb-mist">
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-vb-line bg-vb-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 text-vb-ink"
          aria-label="Open admin menu"
        >
          <Menu size={22} />
        </button>
        <span className="font-heading text-sm font-bold uppercase tracking-tight">
          {siteConfig.shortName} Admin
        </span>
        <span className="w-9" aria-hidden />
      </header>

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

      <main className="min-w-0 flex-1 overflow-x-auto p-4 pt-16 lg:p-10 lg:pt-10">
        {children}
      </main>
    </div>
  );
}
