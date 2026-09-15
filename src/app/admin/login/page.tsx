import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getSessionUser, isAdminUser } from "@/lib/admin/auth";
import {
  allowAdminPreview,
  hasPublicSupabaseConfig,
} from "@/lib/supabase/config";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const configured = hasPublicSupabaseConfig();
  const session = await getSessionUser();

  if (session) {
    const admin = await isAdminUser(session.id);
    if (admin) redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-vb-mist">
      <div className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md border border-vb-line bg-vb-white p-8 sm:p-10">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-vb-muted">
            {siteConfig.shortName}
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight text-vb-ink">
            Admin sign in
          </h1>
          <p className="mt-3 text-sm text-vb-muted">
            Operators only. Shop, services, courier, and content are managed
            here.
          </p>

          {!configured && (
            <div className="mt-6 border border-vb-line bg-vb-mist p-4 text-sm text-vb-muted">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-ink">
                Setup required
              </p>
              <p className="mt-2">
                Add Supabase keys to{" "}
                <code className="text-vb-ink">.env.local</code>, run the
                migration, then promote your user to{" "}
                <code className="text-vb-ink">admin</code>. See{" "}
                <code className="text-vb-ink">docs/SUPABASE_SETUP.md</code>.
              </p>
              {allowAdminPreview() && (
                <p className="mt-3">
                  Dev preview is on —{" "}
                  <Link href="/admin" className="text-vb-accent underline">
                    open admin shell
                  </Link>{" "}
                  without auth.
                </p>
              )}
            </div>
          )}

          {(params.error === "forbidden" ||
            (session && !(await isAdminUser(session.id)))) && (
            <p className="mt-4 text-sm text-vb-danger" role="alert">
              That account is signed in but is not an admin. Promote the user in{" "}
              <code>profiles.role</code>, then refresh.
            </p>
          )}

          <AdminLoginForm configured={configured} />

          <p className="mt-6 text-center text-xs text-vb-muted">
            <Link href="/" className="hover:text-vb-accent">
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
