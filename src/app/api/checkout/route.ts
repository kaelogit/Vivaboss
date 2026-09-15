import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import {
  generateOrderNumber,
  getShippingGbp,
  getSiteUrl,
  getStripe,
  hasStripe,
  toPence,
} from "@/lib/stripe";
import type { CartLine } from "@/lib/cart/types";
import { assertUkPostcode } from "@/lib/uk/postcode";

type CheckoutBody = {
  email: string;
  phone?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  notes?: string;
  lines: CartLine[];
};

export async function POST(request: Request) {
  if (!hasStripe()) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase service role is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as CheckoutBody;
    if (!body.email?.trim() || !body.fullName?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }
    if (!body.addressLine1?.trim() || !body.city?.trim() || !body.postcode?.trim()) {
      return NextResponse.json(
        { error: "A full UK shipping address is required." },
        { status: 400 }
      );
    }

    let postcode: string;
    try {
      postcode = assertUkPostcode(body.postcode);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid postcode." },
        { status: 400 }
      );
    }
    if (!body.lines?.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Re-price from DB where possible
    const productIds = [...new Set(body.lines.map((l) => l.productId))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        "id, name, slug, price_gbp, images, status, requires_approval, offers_installation, installation_price_gbp, track_stock, stock_quantity, allow_preorder"
      )
      .in("id", productIds);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    const byId = new Map((products ?? []).map((p) => [p.id, p]));
    const pricedLines: Array<{
      line: CartLine;
      unit: number;
      total: number;
      name: string;
      slug: string;
      image?: string;
      isPreorder: boolean;
    }> = [];

    for (const line of body.lines) {
      const product = byId.get(line.productId);
      if (!product || product.status !== "active") {
        return NextResponse.json(
          { error: `Product unavailable: ${line.name}` },
          { status: 400 }
        );
      }
      if (product.requires_approval) {
        return NextResponse.json(
          {
            error: `${product.name} requires a custom quote — use Request custom order.`,
          },
          { status: 400 }
        );
      }

      const qty = Math.max(1, line.quantity);
      const stock = product.stock_quantity ?? 0;
      let isPreorder = false;
      if (product.track_stock) {
        if (stock < 1) {
          if (product.allow_preorder === false) {
            return NextResponse.json(
              { error: `${product.name} is out of stock.` },
              { status: 400 }
            );
          }
          isPreorder = true;
        } else if (qty > stock) {
          return NextResponse.json(
            {
              error: `Only ${stock} left of ${product.name}. Reduce quantity or remove from cart.`,
            },
            { status: 400 }
          );
        }
      }

      const base = Number(product.price_gbp);
      const deltas = line.customisation.reduce(
        (sum, c) => sum + (c.price_delta_gbp ?? 0),
        0
      );
      const install =
        line.installationRequested && product.offers_installation
          ? product.installation_price_gbp != null
            ? Number(product.installation_price_gbp)
            : 0
          : 0;
      const unit = base + deltas + install;
      pricedLines.push({
        line: {
          ...line,
          unitPriceGbp: base,
          installationPriceGbp:
            product.installation_price_gbp == null
              ? null
              : Number(product.installation_price_gbp),
          quantity: qty,
          isPreorder,
        },
        unit,
        total: unit * qty,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] ?? line.image,
        isPreorder,
      });
    }

    const subtotal = pricedLines.reduce((s, l) => s + l.total, 0);

    let shippingConfig = undefined as
      | import("@/lib/shipping").ShippingConfig
      | undefined;
    try {
      const { getAdminSetting, shippingToConfig, parseShipping } = await import(
        "@/lib/content/siteSettings"
      );
      const row = await getAdminSetting("shipping");
      if (row?.value) {
        shippingConfig = shippingToConfig(parseShipping(row.value));
      }
    } catch {
      /* use defaults */
    }

    const shipping = getShippingGbp(subtotal, postcode, shippingConfig);
    const total = subtotal + shipping;
    const orderNumber = generateOrderNumber();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        status: "pending_payment",
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        full_name: body.fullName.trim(),
        address_line1: body.addressLine1.trim(),
        address_line2: body.addressLine2?.trim() || null,
        city: body.city.trim(),
        postcode,
        country: "GB",
        subtotal_gbp: subtotal,
        shipping_gbp: shipping,
        total_gbp: total,
        notes: body.notes?.trim() || null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message ?? "Could not create order." },
        { status: 500 }
      );
    }

    const itemRows = pricedLines.map((p) => ({
      order_id: order.id,
      product_id: p.line.productId,
      product_name: p.name,
      product_slug: p.slug,
      unit_price_gbp: p.unit,
      quantity: p.line.quantity,
      line_total_gbp: p.total,
      image_url: p.image ?? null,
      customisation: p.line.customisation,
      installation_requested: p.line.installationRequested,
      installation_price_gbp: p.line.installationRequested
        ? p.line.installationPriceGbp
        : null,
      is_preorder: p.isPreorder,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemRows);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const siteUrl = getSiteUrl();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: body.email.trim().toLowerCase(),
      line_items: [
        ...pricedLines.map((p) => ({
          quantity: p.line.quantity,
          price_data: {
            currency: "gbp",
            unit_amount: toPence(p.unit),
            product_data: {
              name: p.isPreorder ? `${p.name} (Pre-order)` : p.name,
              images: p.image ? [p.image] : undefined,
            },
          },
        })),
        ...(shipping > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "gbp",
                  unit_amount: toPence(shipping),
                  product_data: { name: "UK shipping" },
                },
              },
            ]
          : []),
      ],
      success_url: `${siteUrl}/order/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?cancelled=1`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
    });

    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
