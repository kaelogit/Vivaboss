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
    tracking_number?: string | null;
    tracking_carrier?: string | null;
    tracking_url?: string | null;
    notify_shipped?: boolean;
  };

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("orders")
    .select("id, status, shipped_at, inventory_applied")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const updates: {
    status?: OrderStatus;
    internal_notes?: string | null;
    tracking_number?: string | null;
    tracking_carrier?: string | null;
    tracking_url?: string | null;
    shipped_at?: string | null;
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
  if (body.tracking_number !== undefined) {
    updates.tracking_number =
      typeof body.tracking_number === "string"
        ? body.tracking_number.trim() || null
        : null;
  }
  if (body.tracking_carrier !== undefined) {
    updates.tracking_carrier =
      typeof body.tracking_carrier === "string"
        ? body.tracking_carrier.trim() || null
        : null;
  }
  if (body.tracking_url !== undefined) {
    updates.tracking_url =
      typeof body.tracking_url === "string"
        ? body.tracking_url.trim() || null
        : null;
  }

  const nextStatus = updates.status ?? existing.status;
  const becomingShipped =
    nextStatus === "shipped" && existing.status !== "shipped";
  if (becomingShipped && !existing.shipped_at) {
    updates.shipped_at = new Date().toISOString();
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let order = data;

  const becomingTerminal =
    (nextStatus === "cancelled" || nextStatus === "refunded") &&
    existing.status !== "cancelled" &&
    existing.status !== "refunded";

  let inventoryRestored = false;
  if (becomingTerminal && existing.inventory_applied) {
    try {
      const { restoreOrderInventory } = await import("@/lib/orders/inventory");
      await restoreOrderInventory(
        id,
        nextStatus === "refunded" ? "order_refunded" : "order_cancelled"
      );
      inventoryRestored = true;
      const { data: refreshed } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();
      if (refreshed) order = refreshed;
    } catch (err) {
      console.error("inventory restore failed", err);
    }
  }

  const shouldEmail =
    body.notify_shipped === true ||
    (becomingShipped && body.notify_shipped !== false);

  let shippedEmailSent = false;
  if (shouldEmail && order.status === "shipped") {
    try {
      const { sendOrderShippedEmail } = await import("@/lib/email/orders");
      await sendOrderShippedEmail(order.id);
      shippedEmailSent = true;
    } catch (err) {
      console.error("ship email failed", err);
    }
  }

  return NextResponse.json({
    order,
    shippedEmailSent,
    inventoryRestored,
  });
}
