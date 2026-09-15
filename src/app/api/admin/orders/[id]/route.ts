import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

const STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "pre_order",
  "processing",
  "personalising",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  const { data: serviceJobs } = await supabase
    .from("service_jobs")
    .select("id, status, job_type, specific_service, created_at")
    .eq("related_order_id", id);

  return NextResponse.json({
    order,
    items: items ?? [],
    serviceJobs: serviceJobs ?? [],
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: OrderStatus;
    internal_notes?: string;
  };

  const updates: {
    status?: OrderStatus;
    internal_notes?: string | null;
  } = {};

  if (body.status) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.internal_notes !== undefined) {
    updates.internal_notes = body.internal_notes.trim() || null;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
