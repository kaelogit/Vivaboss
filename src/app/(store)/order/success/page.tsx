import Image from "next/image";
import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import ClearCartOnSuccess from "@/components/shop/ClearCartOnSuccess";
import { formatGbp } from "@/lib/products/money";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { getStripe, hasStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders/markPaid";
import { PREORDER_LEAD } from "@/lib/products/stock";

type Props = {
  searchParams: Promise<{ order?: string; session_id?: string }>;
};

type Line = {
  id: string;
  product_name: string;
  quantity: number;
  line_total_gbp: number;
  image_url: string | null;
  installation_requested: boolean;
  is_preorder: boolean;
};

const PAID = new Set([
  "paid",
  "pre_order",
  "processing",
  "personalising",
  "shipped",
  "delivered",
]);

export const metadata = { title: "Order confirmed" };

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order: orderId, session_id } = await searchParams;

  let orderNumber = orderId?.slice(0, 8) ?? "—";
  let total: number | null = null;
  let shipping: number | null = null;
  let email: string | null = null;
  let status = "received";
  let items: Line[] = [];

  if (orderId && hasAdminClient()) {
    if (session_id && hasStripe()) {
      try {
        const session = await getStripe().checkout.sessions.retrieve(session_id);
        if (session.payment_status === "paid") {
          await markOrderPaid({
            orderId,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
          });
        }
      } catch {
        // Webhook remains fallback
      }
    }

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("order_number, total_gbp, shipping_gbp, email, status")
      .eq("id", orderId)
      .maybeSingle();

    if (data) {
      orderNumber = data.order_number;
      total = Number(data.total_gbp);
      shipping = Number(data.shipping_gbp);
      email = data.email;
      status = data.status;
    }

    const { data: rows } = await supabase
      .from("order_items")
      .select(
        "id, product_name, quantity, line_total_gbp, image_url, installation_requested, is_preorder"
      )
      .eq("order_id", orderId);
    items = (rows ?? []) as Line[];
  }

  const hasPreorder = items.some((i) => i.is_preorder);
  const paid = PAID.has(status);
  const trackHref =
    email && orderNumber !== "—"
      ? `/order/track?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
      : "/order/track";

  const intro = !paid
    ? "We’re confirming your payment with Stripe. This page updates once it clears — a receipt follows by email."
    : hasPreorder
      ? `Payment received. Pre-order pieces typically take ${PREORDER_LEAD}. We’ll email you when they’re ready to ship.`
      : "Payment received. A confirmation email is on its way.";

  return (
    <main>
      <ClearCartOnSuccess />
      <SectionIntro
        eyebrow="Thank you"
        title={
          !paid
            ? "Payment processing"
            : hasPreorder
              ? "Pre-order confirmed"
              : "Order confirmed"
        }
        description={intro}
      />
      <div className="vb-container max-w-xl py-12 sm:py-16">
        <div className="border border-vb-line bg-vb-white p-6 sm:p-8">
          <p className="vb-eyebrow">Order</p>
          <p className="mt-2 font-heading text-2xl font-bold tracking-tight">
            {orderNumber}
          </p>
          <p className="mt-3 text-sm capitalize text-vb-muted">
            {status.replace(/_/g, " ")}
            {total != null ? ` · ${formatGbp(total)}` : ""}
          </p>
          {email && (
            <p className="mt-1 text-sm text-vb-muted">Receipt → {email}</p>
          )}

          {items.length > 0 && (
            <ul className="mt-6 divide-y divide-vb-line border-y border-vb-line">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-vb-mist">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-xs font-bold uppercase tracking-wide text-vb-ink">
                      {item.product_name}
                    </p>
                    <p className="mt-1 text-[11px] text-vb-muted">
                      Qty {item.quantity}
                      {item.is_preorder ? " · Pre-order" : ""}
                      {item.installation_requested ? " · Installation" : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-vb-ink">
                    {formatGbp(Number(item.line_total_gbp))}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {total != null && (
            <div className="mt-4 space-y-1 text-sm text-vb-muted">
              {shipping != null && shipping > 0 && (
                <p className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatGbp(shipping)}</span>
                </p>
              )}
              <p className="flex justify-between font-heading font-semibold text-vb-ink">
                <span>{paid ? "Total paid" : "Total"}</span>
                <span>{formatGbp(total)}</span>
              </p>
            </div>
          )}

          <p className="mt-6 text-sm leading-relaxed text-vb-muted">
            {hasPreorder
              ? "Pre-order items are paid now and made when stock is ready. If you asked for installation, we’ll contact you to book the visit."
              : "We’ll email you again when the order ships, with a tracking link. Installation requests are confirmed separately."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={trackHref}
              className="inline-flex h-11 items-center justify-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
            >
              Track this order
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em]"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
