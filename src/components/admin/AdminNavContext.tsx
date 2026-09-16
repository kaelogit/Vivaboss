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

type NavCtx = {
  pendingHref: string | null;
  isPending: boolean;
  navigate: (href: string) => void;
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

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

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

  const value = useMemo(
    () => ({ pendingHref, isPending, navigate }),
    [pendingHref, isPending, navigate]
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
