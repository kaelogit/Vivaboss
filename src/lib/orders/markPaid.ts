import { createAdminClient } from "@/lib/supabase/admin";
import { applyOrderInventory } from "@/lib/orders/inventory";
import { createServiceJobsFromOrder } from "@/lib/orders/createServiceJobs";
import { sendOrderEmails } from "@/lib/email/orders";
import type { Database } from "@/types/database";

type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

/**
 * Mark order paid, apply inventory once, create install jobs, send emails.
 * Safe to call multiple times (idempotent where possible).
 */
export async function markOrderPaid(input: {
  orderId: string;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
}): Promise<void> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("id, status, inventory_applied")
    .eq("id", input.orderId)
    .maybeSingle();

  if (!existing) return;

  const becomingPaid = existing.status === "pending_payment";

  if (becomingPaid) {
    const { data: items } = await supabase
      .from("order_items")
      .select("is_preorder")
      .eq("order_id", input.orderId);

    const hasPreorder = (items ?? []).some((i) => i.is_preorder);

    const patch: OrderUpdate = {
      status: hasPreorder ? "pre_order" : "paid",
      paid_at: new Date().toISOString(),
    };
    if (input.stripeCheckoutSessionId) {
      patch.stripe_checkout_session_id = input.stripeCheckoutSessionId;
    }
    if (input.stripePaymentIntentId) {
      patch.stripe_payment_intent_id = input.stripePaymentIntentId;
    }
    await supabase.from("orders").update(patch).eq("id", input.orderId);
  } else {
    const patch: OrderUpdate = {};
    if (input.stripeCheckoutSessionId) {
      patch.stripe_checkout_session_id = input.stripeCheckoutSessionId;
    }
    if (input.stripePaymentIntentId) {
      patch.stripe_payment_intent_id = input.stripePaymentIntentId;
    }
    if (Object.keys(patch).length) {
      await supabase.from("orders").update(patch).eq("id", input.orderId);
    }
  }

  try {
    await applyOrderInventory(input.orderId);
  } catch (err) {
    console.error("inventory apply failed", err);
  }

  try {
    await createServiceJobsFromOrder(input.orderId);
  } catch (err) {
    console.error("install service jobs failed", err);
  }

  if (becomingPaid) {
    try {
      await sendOrderEmails(input.orderId);
    } catch (err) {
      console.error("order email failed", err);
    }
  }
}
