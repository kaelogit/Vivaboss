import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { hasResend, DEFAULT_ADMIN_EMAIL } from "@/lib/email/client";
import {
  allowAdminPreview,
  hasPublicSupabaseConfig,
} from "@/lib/supabase/config";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { formatGbp } from "@/lib/products/money";

async function loadKpis() {
  if (!hasAdminClient()) {
    return {
      openOrders: null as number | null,
      todayRevenue: null as number | null,
      openCustom: null as number | null,
      openService: null as number | null,
      openCourier: null as number | null,
    };
  }

  const supabase = createAdminClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    openOrders,
    paidToday,
    openCustom,
    openService,
    openCourier,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "pre_order", "processing", "personalising", "shipped"]),
    supabase
      .from("orders")
      .select("total_gbp")
      .in("status", ["paid", "pre_order"])
      .gte("paid_at", startOfDay.toISOString()),
    supabase
      .from("custom_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "reviewing", "quoted"]),
    supabase
      .from("service_jobs")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "contacted", "scheduled", "in_progress"]),
    supabase
      .from("courier_jobs")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "confirmed", "picked_up"]),
  ]);

  const todayRevenue = (paidToday.data ?? []).reduce(
    (sum, row) => sum + Number(row.total_gbp ?? 0),
    0
  );

  return {
    openOrders: openOrders.count ?? 0,
    todayRevenue,
    openCustom: openCustom.count ?? 0,
    openService: openService.count ?? 0,
    openCourier: openCourier.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const supabasePublic = hasPublicSupabaseConfig();
  const serviceRole = hasAdminClient();
  const preview = allowAdminPreview() && !supabasePublic;
  const resendOk = hasResend();
  const kpis = await loadKpis();

  const attention = [
    {
      label: "Open orders",
      value: kpis.openOrders == null ? "—" : String(kpis.openOrders),
      href: "/admin/orders",
      hint:
        kpis.todayRevenue == null
          ? "Connect Supabase for live counts"
          : `Paid today ${formatGbp(kpis.todayRevenue)}`,
    },
    {
      label: "Custom requests",
      value: kpis.openCustom == null ? "—" : String(kpis.openCustom),
      href: "/admin/custom-requests",
      hint: "New / reviewing / quoted",
    },
    {
      label: "Service jobs",
      value: kpis.openService == null ? "—" : String(kpis.openService),
      href: "/admin/service-jobs",
      hint: "Open pipeline",
    },
    {
      label: "Courier jobs",
      value: kpis.openCourier == null ? "—" : String(kpis.openCourier),
      href: "/admin/courier-jobs",
      hint: "Open pipeline",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Attention-first overview for shop, services, and courier."
      />

      <div className="mb-8 border border-vb-line bg-vb-white p-5">
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
          System status
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center justify-between gap-4 border-b border-vb-line pb-2">
            <span className="text-vb-muted">Supabase public keys</span>
            <span className={supabasePublic ? "text-vb-success" : "text-vb-danger"}>
              {supabasePublic ? "Connected" : "Missing"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-4 border-b border-vb-line pb-2">
            <span className="text-vb-muted">Service role</span>
            <span className={serviceRole ? "text-vb-success" : "text-vb-danger"}>
              {serviceRole ? "Connected" : "Missing"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-4 border-b border-vb-line pb-2">
            <span className="text-vb-muted">Resend email</span>
            <span className={resendOk ? "text-vb-success" : "text-vb-danger"}>
              {resendOk ? `On → ${DEFAULT_ADMIN_EMAIL}` : "Missing API key"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-4">
            <span className="text-vb-muted">Admin preview</span>
            <span className={preview ? "text-vb-accent" : "text-vb-muted"}>
              {preview ? "On (dev)" : "Off"}
            </span>
          </li>
        </ul>
        {!resendOk && (
          <p className="mt-4 text-xs text-vb-muted">
            Set <code className="text-vb-ink">RESEND_API_KEY</code> so every
            order, booking, and contact emails{" "}
            <code className="text-vb-ink">{DEFAULT_ADMIN_EMAIL}</code>. See{" "}
            <code className="text-vb-ink">docs/EMAIL.md</code>.
          </p>
        )}
        {!supabasePublic && (
          <p className="mt-4 text-xs text-vb-muted">
            Follow{" "}
            <code className="text-vb-ink">docs/SUPABASE_SETUP.md</code> to
            connect the project and run migrations.
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {attention.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border border-vb-line bg-vb-white p-5 transition-colors hover:border-vb-ink"
          >
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
              {item.label}
            </p>
            <p className="mt-3 font-heading text-3xl font-bold text-vb-ink">
              {item.value}
            </p>
            <p className="mt-2 text-xs text-vb-muted">{item.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
