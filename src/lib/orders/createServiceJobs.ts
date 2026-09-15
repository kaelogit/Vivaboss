import { createAdminClient } from "@/lib/supabase/admin";

/**
 * When a paid order has installation add-ons, create linked service jobs
 * (source: checkout_addon) so ops sees them on the service board.
 */
export async function createServiceJobsFromOrder(
  orderId: string
): Promise<void> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("service_jobs")
    .select("id")
    .eq("related_order_id", orderId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, email, phone, full_name, address_line1, address_line2, city, postcode"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return;

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "product_name, quantity, installation_requested, installation_price_gbp"
    )
    .eq("order_id", orderId)
    .eq("installation_requested", true);

  if (!items?.length) return;

  const rows = items.map((item) => ({
    job_type: "smart_home_install" as const,
    specific_service: `Install: ${item.product_name}`,
    description: `Installation requested with order ${order.order_number}. Qty ${item.quantity}.${
      item.installation_price_gbp != null
        ? ` Installation line: £${Number(item.installation_price_gbp).toFixed(2)}.`
        : " Installation quoted / included at checkout."
    }`,
    photos: [] as string[],
    address_line1: order.address_line1,
    address_line2: order.address_line2,
    city: order.city,
    postcode: order.postcode,
    preferred_window: null as string | null,
    full_name: order.full_name,
    email: order.email,
    phone: order.phone,
    whatsapp: order.phone,
    source: "checkout_addon" as const,
    related_order_id: order.id,
    status: "new" as const,
  }));

  const { data: created, error } = await supabase
    .from("service_jobs")
    .insert(rows)
    .select("id");

  if (error) {
    console.error("createServiceJobsFromOrder failed", error);
    return;
  }

  try {
    const { sendServiceJobEmails } = await import("@/lib/email/bookings");
    for (const job of created ?? []) {
      await sendServiceJobEmails(job.id);
    }
  } catch (err) {
    console.error("install job email failed", err);
  }
}
