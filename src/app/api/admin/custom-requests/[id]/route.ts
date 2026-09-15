import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import {
  generateOrderNumber,
  getSiteUrl,
  getStripe,
  hasStripe,
  toPence,
} from "@/lib/stripe";
import type { CustomRequestStatus, Json } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

const STATUSES: CustomRequestStatus[] = [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "converted_to_order",
];

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ request: data });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: CustomRequestStatus;
    quote_amount_gbp?: number | null;
    quote_message?: string | null;
  };

  const updates: {
    status?: CustomRequestStatus;
    quote_amount_gbp?: number | null;
    quote_message?: string | null;
  } = {};

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.quote_amount_gbp !== undefined) {
    if (body.quote_amount_gbp === null) {
      updates.quote_amount_gbp = null;
    } else {
      const amount = Number(body.quote_amount_gbp);
      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json(
          { error: "Invalid quote amount." },
          { status: 400 }
        );
      }
      updates.quote_amount_gbp = Math.round(amount * 100) / 100;
    }
  }

  if (body.quote_message !== undefined) {
    updates.quote_message =
      typeof body.quote_message === "string"
        ? body.quote_message.trim() || null
        : null;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("custom_requests")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const shouldSendQuote =
    body.status === "quoted" &&
    data.quote_amount_gbp != null &&
    Number(data.quote_amount_gbp) > 0;

  if (shouldSendQuote) {
    try {
      const { sendCustomQuoteEmail } = await import("@/lib/email/orders");
      await sendCustomQuoteEmail(data.id);
    } catch (err) {
      console.error("custom quote email failed", err);
    }
  }

  return NextResponse.json({ request: data });
}

/** Convert a quoted custom request into a pending order + Stripe Checkout session. */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }
  if (!hasStripe()) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  const { id } = await params;
  let action = "convert";
  try {
    const body = (await request.json()) as { action?: string };
    if (body.action) action = body.action;
  } catch {
    /* empty body is fine — default convert */
  }

  if (action !== "convert") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: req, error: loadError } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: loadError.message }, { status: 500 });
  }
  if (!req) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (req.status === "converted_to_order") {
    return NextResponse.json(
      { error: "Already converted to an order." },
      { status: 400 }
    );
  }
  if (req.quote_amount_gbp == null || Number(req.quote_amount_gbp) <= 0) {
    return NextResponse.json(
      { error: "Set a quote amount before converting to pay." },
      { status: 400 }
    );
  }

  const amount = Number(req.quote_amount_gbp);
  const orderNumber = generateOrderNumber();
  const productLabel = req.product_name?.trim() || "Custom order";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "pending_payment",
      email: req.email,
      phone: req.phone,
      full_name: req.full_name,
      address_line1: "To be confirmed",
      address_line2: null,
      city: "TBC",
      postcode: "TBC",
      country: "GB",
      subtotal_gbp: amount,
      shipping_gbp: 0,
      total_gbp: amount,
      notes: [
        `Converted from custom request ${req.id}`,
        req.message ? `Customer message: ${req.message}` : null,
        req.instructions ? `Instructions: ${req.instructions}` : null,
        req.quote_message ? `Quote note: ${req.quote_message}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      internal_notes: `custom_request_id=${req.id}`,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Could not create order." },
      { status: 500 }
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: req.product_id,
    product_name: productLabel,
    product_slug: null,
    unit_price_gbp: amount,
    quantity: 1,
    line_total_gbp: amount,
    image_url: null,
    customisation: {
      preferred_material: req.preferred_material,
      instructions: req.instructions,
      message: req.message,
      uploads: req.uploads,
      field_snapshot: req.field_snapshot,
      custom_request_id: req.id,
    },
    installation_requested: false,
    installation_price_gbp: null,
  });

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const siteUrl = getSiteUrl();
  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: toPence(amount),
            product_data: {
              name: productLabel,
              description: req.quote_message?.slice(0, 500) || undefined,
            },
          },
        },
      ],
      success_url: `${siteUrl}/order/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/admin/custom-requests/${req.id}?cancelled=1`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        custom_request_id: req.id,
      },
    });

    if (!session.url) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    const prevSnapshot =
      req.field_snapshot &&
      typeof req.field_snapshot === "object" &&
      !Array.isArray(req.field_snapshot)
        ? (req.field_snapshot as Record<string, Json | undefined>)
        : {};

    const { data: updated, error: updateError } = await supabase
      .from("custom_requests")
      .update({
        status: "converted_to_order",
        field_snapshot: {
          ...prevSnapshot,
          order_id: order.id,
          order_number: order.order_number,
          stripe_checkout_session_id: session.id,
          checkout_url: session.url,
        },
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      request: updated,
      orderId: order.id,
      orderNumber: order.order_number,
      checkoutUrl: session.url,
      stripeSessionId: session.id,
    });
  } catch (err) {
    await supabase.from("orders").delete().eq("id", order.id);
    const message =
      err instanceof Error ? err.message : "Could not create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
