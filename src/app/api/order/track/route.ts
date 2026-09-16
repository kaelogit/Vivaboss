import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

type Body = {
  orderNumber: string;
  email: string;
};

/** Public order status lookup — requires order number + email match. */
export async function POST(request: Request) {
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Tracking is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as Body;
    const orderNumber = body.orderNumber?.trim().toUpperCase();
    const email = body.email?.trim().toLowerCase();
    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Order number and email are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, full_name, created_at, paid_at, total_gbp, shipping_gbp, postcode, city, tracking_number, tracking_carrier, tracking_url, shipped_at"
      )
      .eq("order_number", orderNumber)
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json(
        { error: "No order found for that number and email." },
        { status: 404 }
      );
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, quantity, line_total_gbp, installation_requested")
      .eq("order_id", order.id);

    return NextResponse.json({
      order: {
        orderNumber: order.order_number,
        status: order.status,
        createdAt: order.created_at,
        paidAt: order.paid_at,
        totalGbp: order.total_gbp,
        shippingGbp: order.shipping_gbp,
        shipTo: `${order.city} ${order.postcode}`,
        trackingNumber: order.tracking_number,
        trackingCarrier: order.tracking_carrier,
        trackingUrl: order.tracking_url,
        shippedAt: order.shipped_at,
        items: (items ?? []).map((i) => ({
          name: i.product_name,
          quantity: i.quantity,
          lineTotal: i.line_total_gbp,
          installation: i.installation_requested,
        })),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
