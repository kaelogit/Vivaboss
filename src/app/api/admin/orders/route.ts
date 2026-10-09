import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { syncOrderPaymentFromStripe } from "@/lib/orders/syncStripePayment";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable.", orders: [] },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();

  // Catch paid checkouts that never flipped from unpaid (webhook miss).
  const { data: pending } = await supabase
    .from("orders")
    .select("id")
    .eq("status", "pending_payment")
    .not("stripe_checkout_session_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (pending?.length) {
    await Promise.allSettled(
      pending.map((row) => syncOrderPaymentFromStripe(row.id))
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, email, full_name, total_gbp, created_at, paid_at, fulfillment_method"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ orders: data ?? [] });
}
