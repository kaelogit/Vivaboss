import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import type { CustomerSummary } from "@/lib/admin/customers";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

type Touch = {
  email: string;
  name: string | null;
  at: string;
  kind: "order" | "custom_request" | "service_job" | "courier_job";
};

function normEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.trim().toLowerCase();
  return e.includes("@") ? e : null;
}

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase not configured.", customers: [] },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const [orders, customs, services, couriers] = await Promise.all([
    supabase.from("orders").select("email, full_name, created_at").limit(2000),
    supabase
      .from("custom_requests")
      .select("email, full_name, created_at")
      .limit(2000),
    supabase
      .from("service_jobs")
      .select("email, full_name, created_at")
      .limit(2000),
    supabase
      .from("courier_jobs")
      .select("email, full_name, created_at")
      .limit(2000),
  ]);

  const err =
    orders.error?.message ||
    customs.error?.message ||
    services.error?.message ||
    couriers.error?.message;
  if (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const touches: Touch[] = [];

  for (const row of orders.data ?? []) {
    const email = normEmail(row.email);
    if (!email) continue;
    touches.push({
      email,
      name: row.full_name,
      at: row.created_at,
      kind: "order",
    });
  }
  for (const row of customs.data ?? []) {
    const email = normEmail(row.email);
    if (!email) continue;
    touches.push({
      email,
      name: row.full_name,
      at: row.created_at,
      kind: "custom_request",
    });
  }
  for (const row of services.data ?? []) {
    const email = normEmail(row.email);
    if (!email) continue;
    touches.push({
      email,
      name: row.full_name,
      at: row.created_at,
      kind: "service_job",
    });
  }
  for (const row of couriers.data ?? []) {
    const email = normEmail(row.email);
    if (!email) continue;
    touches.push({
      email,
      name: row.full_name,
      at: row.created_at,
      kind: "courier_job",
    });
  }

  const map = new Map<string, CustomerSummary>();

  for (const t of touches) {
    let row = map.get(t.email);
    if (!row) {
      row = {
        email: t.email,
        name: t.name,
        orderCount: 0,
        customRequestCount: 0,
        serviceJobCount: 0,
        courierJobCount: 0,
        totalTouchpoints: 0,
        lastActivityAt: null,
      };
      map.set(t.email, row);
    }
    if (t.name && !row.name) row.name = t.name;
    if (
      !row.lastActivityAt ||
      new Date(t.at).getTime() > new Date(row.lastActivityAt).getTime()
    ) {
      row.lastActivityAt = t.at;
      if (t.name) row.name = t.name;
    }
    row.totalTouchpoints += 1;
    if (t.kind === "order") row.orderCount += 1;
    if (t.kind === "custom_request") row.customRequestCount += 1;
    if (t.kind === "service_job") row.serviceJobCount += 1;
    if (t.kind === "courier_job") row.courierJobCount += 1;
  }

  const customers = Array.from(map.values()).sort((a, b) => {
    const at = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
    const bt = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
    return bt - at;
  });

  return NextResponse.json({ customers });
}
