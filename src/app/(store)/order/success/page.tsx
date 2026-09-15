import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import ClearCartOnSuccess from "@/components/shop/ClearCartOnSuccess";
import { formatGbp } from "@/lib/products/money";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { getStripe, hasStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders/markPaid";

type Props = {
  searchParams: Promise<{ order?: string; session_id?: string }>;
};

export const metadata = { title: "Order confirmed" };

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order: orderId, session_id } = await searchParams;

  let orderNumber = orderId?.slice(0, 8) ?? "—";
  let total: number | null = null;
  let email: string | null = null;
  let status = "received";
  let hasPreorder = false;

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
      .select("order_number, total_gbp, email, status")
      .eq("id", orderId)
      .maybeSingle();

    if (data) {
      orderNumber = data.order_number;
      total = Number(data.total_gbp);
      email = data.email;
      status = data.status;
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("is_preorder")
      .eq("order_id", orderId);
    hasPreorder = (items ?? []).some((i) => i.is_preorder);
  }

  return (
    <main>
      <ClearCartOnSuccess />
      <SectionIntro
        eyebrow="Thank you"
        title={hasPreorder ? "Pre-order confirmed" : "Order confirmed"}
        description={
          hasPreorder
            ? "We’ve received your payment. Pre-order pieces typically take 10–14 days — we’ll be in touch when they’re ready to ship."
            : "We’ve received your order. A confirmation email is on its way when payment clears."
        }
      />
      <div className="vb-container max-w-xl py-12 sm:py-16">
        <div className="border border-vb-line bg-vb-white p-8">
          <p className="vb-eyebrow">Order</p>
          <p className="mt-2 font-heading text-2xl font-bold tracking-tight">
            {orderNumber}
          </p>
          {total != null && (
            <p className="mt-4 text-sm text-vb-muted">
              Total {formatGbp(total)} · Status: {status.replace(/_/g, " ")}
            </p>
          )}
          {email && (
            <p className="mt-2 text-sm text-vb-muted">Confirmation → {email}</p>
          )}
          <p className="mt-6 text-sm leading-relaxed text-vb-muted">
            {hasPreorder
              ? "Sold-out items on pre-order are paid for now and fulfilled when stock arrives. Personalised pieces and installation requests follow the usual craft timeline."
              : "Personalised items may take a little longer — we craft each one with care. If you requested installation, we’ll be in touch to schedule."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center bg-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent"
            >
              Continue shopping
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center border border-vb-ink px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em]"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
