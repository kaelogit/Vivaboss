"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  emptyNavCounts,
  navCountsTotal,
  type AdminNavCounts,
} from "@/lib/admin/navCounts";

type NavCtx = {
  pendingHref: string | null;
  isPending: boolean;
  navigate: (href: string) => void;
  counts: AdminNavCounts;
  attentionTotal: number;
  refreshCounts: () => void;
};

const AdminNavContext = createContext<NavCtx | null>(null);

export function useAdminNav() {
  const ctx = useContext(AdminNavContext);
  if (!ctx) {
    throw new Error("useAdminNav must be used within AdminNavProvider");
  }
  return ctx;
}

export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [counts, setCounts] = useState<AdminNavCounts>(emptyNavCounts);

  const refreshCounts = useCallback(() => {
    fetch("/api/admin/nav-counts")
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as AdminNavCounts;
        setCounts({
          orders: Number(data.orders) || 0,
          customRequests: Number(data.customRequests) || 0,
          serviceJobs: Number(data.serviceJobs) || 0,
          courierJobs: Number(data.courierJobs) || 0,
          reviews: Number(data.reviews) || 0,
        });
      })
      .catch(() => {
        /* keep last known counts */
      });
  }, []);

  useEffect(() => {
    setPendingHref(null);
    refreshCounts();
  }, [pathname, refreshCounts]);

  useEffect(() => {
    const id = window.setInterval(refreshCounts, 60_000);
    const onFocus = () => refreshCounts();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCounts]);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;
      setPendingHref(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router]
  );

  const attentionTotal = navCountsTotal(counts);

  const value = useMemo(
    () => ({
      pendingHref,
      isPending,
      navigate,
      counts,
      attentionTotal,
      refreshCounts,
    }),
    [pendingHref, isPending, navigate, counts, attentionTotal, refreshCounts]
  );

  return (
    <AdminNavContext.Provider value={value}>{children}</AdminNavContext.Provider>
  );
}

export function useAdminNavPending() {
  const { pendingHref, isPending } = useAdminNav();
  const pathname = usePathname();
  return Boolean(pendingHref) && (isPending || pendingHref !== pathname);
}
