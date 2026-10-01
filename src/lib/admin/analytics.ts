import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/database";

const PAID_STATUSES: OrderStatus[] = [
  "paid",
  "pre_order",
  "processing",
  "personalising",
  "shipped",
  "delivered",
];

export type DayPoint = { date: string; label: string; revenue: number; orders: number };

export type StatusSlice = { status: string; label: string; count: number };

export type TopProduct = {
  name: string;
  quantity: number;
  revenue: number;
};

export type RecentOrder = {
  id: string;
  order_number: string;
  status: string;
  full_name: string;
  total_gbp: number;
  paid_at: string | null;
  created_at: string;
};

export type DashboardAnalytics = {
  connected: boolean;
  revenueToday: number;
  revenue30d: number;
  revenuePrev30d: number;
  orders30d: number;
  ordersPrev30d: number;
  aov30d: number;
  openOrders: number;
  openCustom: number;
  openService: number;
  openCourier: number;
  pendingReviews: number;
  revenueSeries: DayPoint[];
  statusBreakdown: StatusSlice[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending",
  paid: "Paid",
  pre_order: "Pre-order",
  processing: "Processing",
  personalising: "Personalising",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

function startOfLocalDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shortLabel(key: string) {
  const [, m, d] = key.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function emptyAnalytics(): DashboardAnalytics {
  return {
    connected: false,
    revenueToday: 0,
    revenue30d: 0,
    revenuePrev30d: 0,
    orders30d: 0,
    ordersPrev30d: 0,
    aov30d: 0,
    openOrders: 0,
    openCustom: 0,
    openService: 0,
    openCourier: 0,
    pendingReviews: 0,
    revenueSeries: [],
    statusBreakdown: [],
    topProducts: [],
    recentOrders: [],
  };
}

export async function loadDashboardAnalytics(): Promise<DashboardAnalytics> {
  if (!hasAdminClient()) return emptyAnalytics();

  const supabase = createAdminClient();
  const today = startOfLocalDay();
  const rangeStart = startOfLocalDay();
  rangeStart.setDate(rangeStart.getDate() - 29);
  const prevStart = startOfLocalDay();
  prevStart.setDate(prevStart.getDate() - 59);
  const prevEnd = startOfLocalDay();
  prevEnd.setDate(prevEnd.getDate() - 30);

  const [
    paidOrders,
    prevPaid,
    openOrders,
    openCustom,
    openService,
    openCourier,
    pendingReviews,
    allStatus,
    recent,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total_gbp, paid_at, status")
      .not("paid_at", "is", null)
      .gte("paid_at", rangeStart.toISOString())
      .in("status", PAID_STATUSES),
    supabase
      .from("orders")
      .select("total_gbp, paid_at")
      .not("paid_at", "is", null)
      .gte("paid_at", prevStart.toISOString())
      .lt("paid_at", prevEnd.toISOString())
      .in("status", PAID_STATUSES),
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
    supabase.from("orders").select("status").limit(2000),
    supabase
      .from("orders")
      .select(
        "id, order_number, status, full_name, total_gbp, paid_at, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const paidRows = paidOrders.data ?? [];
  const todayKey = dayKey(today);

  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(rangeStart);
    d.setDate(rangeStart.getDate() + i);
    byDay.set(dayKey(d), { revenue: 0, orders: 0 });
  }

  let revenueToday = 0;
  let revenue30d = 0;
  for (const row of paidRows) {
    const amount = Number(row.total_gbp ?? 0);
    revenue30d += amount;
    if (!row.paid_at) continue;
    const key = dayKey(new Date(row.paid_at));
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.revenue += amount;
      bucket.orders += 1;
    }
    if (key === todayKey) revenueToday += amount;
  }

  const revenuePrev30d = (prevPaid.data ?? []).reduce(
    (sum, row) => sum + Number(row.total_gbp ?? 0),
    0
  );
  const orders30d = paidRows.length;
  const ordersPrev30d = prevPaid.data?.length ?? 0;
  const aov30d = orders30d > 0 ? revenue30d / orders30d : 0;

  const revenueSeries: DayPoint[] = [...byDay.entries()].map(([date, v]) => ({
    date,
    label: shortLabel(date),
    revenue: Math.round(v.revenue * 100) / 100,
    orders: v.orders,
  }));

  const statusCounts = new Map<string, number>();
  for (const row of allStatus.data ?? []) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }
  const statusBreakdown: StatusSlice[] = [...statusCounts.entries()]
    .map(([status, count]) => ({
      status,
      label: STATUS_LABELS[status] ?? status,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const paidIds = paidRows.map((r) => r.id);
  let topProducts: TopProduct[] = [];
  if (paidIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, quantity, line_total_gbp, order_id")
      .in("order_id", paidIds.slice(0, 500));

    const productMap = new Map<string, TopProduct>();
    for (const item of items ?? []) {
      const key = item.product_name;
      const existing = productMap.get(key) ?? {
        name: key,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += Number(item.quantity ?? 0);
      existing.revenue += Number(item.line_total_gbp ?? 0);
      productMap.set(key, existing);
    }
    topProducts = [...productMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }

  return {
    connected: true,
    revenueToday,
    revenue30d,
    revenuePrev30d,
    orders30d,
    ordersPrev30d,
    aov30d,
    openOrders: openOrders.count ?? 0,
    openCustom: openCustom.count ?? 0,
    openService: openService.count ?? 0,
    openCourier: openCourier.count ?? 0,
    pendingReviews: pendingReviews.count ?? 0,
    revenueSeries,
    statusBreakdown,
    topProducts,
    recentOrders: (recent.data ?? []) as RecentOrder[],
  };
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}
