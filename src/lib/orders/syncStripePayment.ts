import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, hasStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders/markPaid";

/**
 * If the order is still pending_payment but Stripe shows paid, mark it paid.
 * Returns true when status was updated.
 */
export async function syncOrderPaymentFromStripe(
  orderId: string
): Promise<boolean> {
  if (!hasStripe()) return false;

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, stripe_checkout_session_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status !== "pending_payment") return false;
  if (!order.stripe_checkout_session_id) return false;

  const session = await getStripe().checkout.sessions.retrieve(
    order.stripe_checkout_session_id
  );

  const paid =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";

  if (!paid) return false;

  await markOrderPaid({
    orderId,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
  });

  return true;
}
