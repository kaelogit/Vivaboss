import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DashboardAnalytics from "@/components/admin/DashboardAnalytics";
import { loadDashboardAnalytics } from "@/lib/admin/analytics";

export default async function AdminDashboardPage() {
  const data = await loadDashboardAnalytics();

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Live revenue, orders, and pipeline analytics for the shop."
      />
      <DashboardAnalytics data={data} />
    </div>
  );
}
