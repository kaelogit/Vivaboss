import { getSessionUser, requireAdminUser } from "@/lib/admin/auth";
import {
  allowAdminPreview,
  hasPublicSupabaseConfig,
} from "@/lib/supabase/config";
import AdminShell from "@/components/admin/AdminShell";
import { redirect } from "next/navigation";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();

  if (!user) {
    const session = await getSessionUser();
    if (session) {
      redirect("/admin/login?error=forbidden");
    }
    redirect("/admin/login");
  }

  const preview =
    allowAdminPreview() &&
    (!hasPublicSupabaseConfig() || user.id === "preview-admin");

  return (
    <>
      {preview && (
        <div className="bg-vb-accent px-4 py-2 text-center font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
          Admin preview mode — connect Supabase before go-live
        </div>
      )}
      <AdminShell email={user.email ?? "admin"}>{children}</AdminShell>
    </>
  );
}
