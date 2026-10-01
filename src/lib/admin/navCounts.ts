import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

export type AdminNavCounts = {
  orders: number;
  customRequests: number;
  serviceJobs: number;
  courierJobs: number;
  reviews: number;
};

export const emptyNavCounts: AdminNavCounts = {
  orders: 0,
  customRequests: 0,
  serviceJobs: 0,
  courierJobs: 0,
  reviews: 0,
};

/** Open / needs-attention counts for admin nav badges. */
export async function loadAdminNavCounts(): Promise<AdminNavCounts> {
  if (!hasAdminClient()) return emptyNavCounts;

  const supabase = createAdminClient();
  const [orders, customRequests, serviceJobs, courierJobs, reviews] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", [
          "paid",
          "pre_order",
          "processing",
          "personalising",
          "shipped",
        ]),
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
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("is_published", false),
    ]);

  return {
    orders: orders.count ?? 0,
    customRequests: customRequests.count ?? 0,
    serviceJobs: serviceJobs.count ?? 0,
    courierJobs: courierJobs.count ?? 0,
    reviews: reviews.count ?? 0,
  };
}

export function navCountsTotal(counts: AdminNavCounts): number {
  return (
    counts.orders +
    counts.customRequests +
    counts.serviceJobs +
    counts.courierJobs +
    counts.reviews
  );
}
