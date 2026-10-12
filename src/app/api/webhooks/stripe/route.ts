import { NextResponse, after } from "next/server";
import type Stripe from "stripe";
import { hasAdminClient } from "@/lib/supabase/admin";
import { getStripe, hasStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders/markPaid";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!hasStripe() || !hasAdminClient()) {
    console.error("[stripe webhook] Stripe or Supabase not configured");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[stripe webhook] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET." },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    console.error("[stripe webhook] signature failed", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const paid =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required" ||
      event.type === "checkout.session.async_payment_succeeded";

    if (orderId && paid) {
      const stripeCheckoutSessionId = session.id;
      const stripePaymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      // Return 2xx immediately; fulfil after so Stripe never times out.
      after(async () => {
        try {
          await markOrderPaid({
            orderId,
            stripeCheckoutSessionId,
            stripePaymentIntentId,
          });
        } catch (err) {
          console.error("[stripe webhook] markOrderPaid failed", err);
        }
      });
    }
  }

  return NextResponse.json({ received: true });
}
