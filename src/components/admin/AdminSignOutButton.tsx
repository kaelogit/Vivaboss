"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasPublicSupabaseConfig } from "@/lib/supabase/config";

export default function AdminSignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    if (hasPublicSupabaseConfig()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.refresh();
    router.push("/admin/login");
  };

  return (
    <button
      type="button"
      onClick={signOut}
      className="flex w-full items-center gap-2 px-2 py-2 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted transition-colors hover:text-vb-danger"
    >
      <LogOut size={14} />
      Sign out
    </button>
  );
}
