import { formatGbp } from "@/lib/products/money";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminEmailsFor,
  emailFrom,
  emailReplyTo,
  getResend,
  hasResend,
  resolveAdminNotifyEmails,
} from "@/lib/email/client";
import { getSiteUrl } from "@/lib/stripe";

export async function sendOrderEmails(orderId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped order notify to",
      (await resolveAdminNotifyEmails()).join(", ")
    );
    return;
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  const lines = (items ?? [])
    .map((item) => {
      const customBits = Array.isArray(item.customisation)
        ? (item.customisation as { label?: string; value?: string }[])
            .map((c) => `${c.label ?? ""}: ${c.value ?? ""}`)
            .filter((s) => s.trim() !== ":")
            .join("; ")
        : "";
      const preorderBadge = item.is_preorder
        ? `<br/><span style="color:#b4532a;font-size:12px;">Pre-order · typically 10–14 days</span>`
        : "";
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.product_name} × ${item.quantity}${customBits ? `<br/><span style="color:#666;font-size:12px;">${customBits}</span>` : ""}${item.installation_requested ? `<br/><span style="color:#b4532a;font-size:12px;">Installation requested</span>` : ""}${preorderBadge}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatGbp(Number(item.line_total_gbp))}</td>
      </tr>`;
    })
    .join("");

  const hasPreorder = (items ?? []).some((i) => i.is_preorder);
  const preorderNote = hasPreorder
    ? `<p style="margin-top:16px;padding:12px;background:#f9f8f6;border:1px solid #e8e6e1;font-size:14px;color:#666;">One or more items are on pre-order and typically take <strong>10–14 days</strong> after payment. We’ll be in touch when they’re ready to ship.</p>`
    : "";

  const address = [
    order.full_name,
    order.address_line1,
    order.address_line2,
    `${order.city} ${order.postcode}`,
    order.country,
  ]
    .filter(Boolean)
    .join("<br/>");

  const site = getSiteUrl();
  const htmlCustomer = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#121110;">
      <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
      <h1 style="font-size:24px;">Thank you for your order</h1>
      <p>Order <strong>${order.order_number}</strong> · ${formatGbp(Number(order.total_gbp))}</p>
      ${preorderNote}
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">${lines}</table>
      <p style="color:#666;font-size:14px;">Shipping ${formatGbp(Number(order.shipping_gbp))}</p>
      <p style="margin-top:24px;"><strong>Ship to</strong><br/>${address}</p>
      <p style="margin-top:24px;color:#666;font-size:13px;">Questions? Reply to this email or visit <a href="${site}/contact">${site.replace(/^https?:\/\//, "")}/contact</a>.</p>
    </div>
  `;

  const htmlAdmin = `
    <div style="font-family:sans-serif;max-width:560px;">
      <h2>New paid order ${order.order_number}${hasPreorder ? " (includes pre-order)" : ""}</h2>
      <p>${order.full_name} · ${order.email}${order.phone ? ` · ${order.phone}` : ""}</p>
      <p>Total ${formatGbp(Number(order.total_gbp))}</p>
      <table style="width:100%;border-collapse:collapse;">${lines}</table>
      <p><a href="${site}/admin/orders/${order.id}">Open in admin</a></p>
    </div>
  `;

  const resend = getResend();
  const from = emailFrom("order");
  const replyTo = emailReplyTo();

  await resend.emails.send({
    from,
    to: order.email,
    replyTo,
    subject: `Order ${order.order_number} confirmed — Vivaboss`,
    html: htmlCustomer,
  });

  const admins = await adminEmailsFor("order");
  if (admins.length) {
    await resend.emails.send({
      from,
      to: admins,
      replyTo: order.email,
      subject: `New order ${order.order_number}`,
      html: htmlAdmin,
    });
  }
}

export async function sendOrderShippedEmail(orderId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped ship notify to",
      (await resolveAdminNotifyEmails()).join(", ")
    );
    return;
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  const site = getSiteUrl();
  const trackPage = `${site}/order/track`;
  const carrier = order.tracking_carrier?.trim() || null;
  const number = order.tracking_number?.trim() || null;
  const url = order.tracking_url?.trim() || null;

  const trackingBlock = [
    carrier ? `<p><strong>Carrier:</strong> ${escapeHtml(carrier)}</p>` : "",
    number
      ? `<p><strong>Tracking number:</strong> ${escapeHtml(number)}</p>`
      : "",
    url
      ? `<p style="margin:20px 0;"><a href="${url}" style="display:inline-block;background:#b4532a;color:#fff;text-decoration:none;padding:12px 20px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;">Track parcel</a></p>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const htmlCustomer = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#121110;">
      <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
      <h1 style="font-size:24px;">Your order is on its way</h1>
      <p>Hi ${escapeHtml(order.full_name)},</p>
      <p>Order <strong>${escapeHtml(order.order_number)}</strong> has shipped.</p>
      ${trackingBlock || "<p>We’ll share tracking details here as soon as they’re available.</p>"}
      <p style="margin-top:24px;color:#666;font-size:13px;">
        You can also check status anytime at
        <a href="${trackPage}">${trackPage.replace(/^https?:\/\//, "")}</a>
        with your order number and email.
      </p>
      <p style="margin-top:16px;color:#666;font-size:13px;">Questions? <a href="${site}/contact">Contact Vivaboss</a>.</p>
    </div>
  `;

  const resend = getResend();
  const from = emailFrom("order");
  const replyTo = emailReplyTo();
  await resend.emails.send({
    from,
    to: order.email,
    replyTo,
    subject: `Order ${order.order_number} shipped — Vivaboss`,
    html: htmlCustomer,
  });

  const admins = await adminEmailsFor("order");
  if (admins.length) {
    await resend.emails.send({
      from,
      to: admins,
      replyTo: order.email,
      subject: `Shipped — ${order.order_number}`,
      html: `
      <div style="font-family:sans-serif;">
        <h2>Ship email sent</h2>
        <p>${escapeHtml(order.full_name)} · ${escapeHtml(order.email)}</p>
        <p>Order ${escapeHtml(order.order_number)}</p>
        ${carrier ? `<p>Carrier: ${escapeHtml(carrier)}</p>` : ""}
        ${number ? `<p>Tracking: ${escapeHtml(number)}</p>` : ""}
        ${url ? `<p><a href="${url}">Tracking URL</a></p>` : ""}
        <p><a href="${site}/admin/orders/${order.id}">Open in admin</a></p>
      </div>
    `,
  });
  }
}

export async function sendCustomRequestEmails(requestId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped custom request notify to",
      (await resolveAdminNotifyEmails()).join(", ")
    );
    return;
  }

  const supabase = createAdminClient();
  const { data: req } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return;

  const resend = getResend();
  const from = emailFrom("custom");
  const replyTo = emailReplyTo();
  const site = getSiteUrl();
  const admins = await adminEmailsFor("custom");

  await resend.emails.send({
    from,
    to: req.email,
    replyTo,
    subject: `We received your custom request — Vivaboss`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">Request received</h1>
        <p>Thanks ${req.full_name}. We’ll review${req.product_name ? ` your request for <strong>${req.product_name}</strong>` : ""} and come back with a quote.</p>
      </div>
    `,
  });

  if (admins.length) {
    await resend.emails.send({
      from,
      to: admins,
      replyTo: req.email,
      subject: `Custom request — ${req.product_name ?? "Vivaboss"}`,
      html: `
        <div style="font-family:sans-serif;">
          <h2>New custom request</h2>
          <p>${req.full_name} · ${req.email}${req.phone ? ` · ${req.phone}` : ""}</p>
          <p>Product: ${req.product_name ?? "—"}</p>
          <p><a href="${site}/admin/custom-requests/${req.id}">Open admin</a></p>
        </div>
      `,
    });
  }
}

export async function sendCustomQuoteEmail(requestId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped custom quote notify to",
      (await resolveAdminNotifyEmails()).join(", ")
    );
    return;
  }

  const supabase = createAdminClient();
  const { data: req } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return;
  if (req.quote_amount_gbp == null) return;

  const amount = formatGbp(Number(req.quote_amount_gbp));
  const resend = getResend();
  const from = emailFrom("custom");
  const replyTo = emailReplyTo();
  const site = getSiteUrl();
  const admins = await adminEmailsFor("custom");
  const quoteNote = req.quote_message
    ? `<p style="margin-top:16px;white-space:pre-wrap;">${escapeHtml(req.quote_message)}</p>`
    : "";

  const snapshot =
    req.field_snapshot &&
    typeof req.field_snapshot === "object" &&
    !Array.isArray(req.field_snapshot)
      ? (req.field_snapshot as Record<string, unknown>)
      : {};
  const checkoutUrl =
    typeof snapshot.checkout_url === "string" ? snapshot.checkout_url : null;

  const payBlock = checkoutUrl
    ? `
        <p style="margin:28px 0 12px;">
          <a href="${checkoutUrl}" style="display:inline-block;background:#b4532a;color:#fff;text-decoration:none;padding:14px 22px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;">
            Pay securely now
          </a>
        </p>
        <p style="color:#666;font-size:12px;">Or copy this link: <a href="${checkoutUrl}">${checkoutUrl}</a></p>
      `
    : `
        <p style="margin-top:24px;color:#666;font-size:13px;">
          Next we’ll send a secure Stripe pay link to this email. Questions? Reply here or visit
          <a href="${site}/contact">${site.replace(/^https?:\/\//, "")}/contact</a>.
        </p>
      `;

  await resend.emails.send({
    from,
    to: req.email,
    replyTo,
    subject: `Your Vivaboss quote — ${amount}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">Your custom quote</h1>
        <p>Hi ${escapeHtml(req.full_name)},</p>
        <p>We’ve prepared a quote${req.product_name ? ` for <strong>${escapeHtml(req.product_name)}</strong>` : ""}:</p>
        <p style="font-size:28px;font-weight:600;margin:20px 0;">${amount}</p>
        ${quoteNote}
        ${payBlock}
      </div>
    `,
  });

  if (admins.length) {
    await resend.emails.send({
      from,
      to: admins,
      replyTo: req.email,
      subject: `Quote sent — ${req.product_name ?? "Custom"} · ${amount}`,
      html: `
      <div style="font-family:sans-serif;">
        <h2>Custom quote emailed</h2>
        <p>${escapeHtml(req.full_name)} · ${escapeHtml(req.email)}</p>
        <p>Amount: ${amount}</p>
        ${req.quote_message ? `<p>${escapeHtml(req.quote_message)}</p>` : ""}
        <p><a href="${site}/admin/custom-requests/${req.id}">Open in admin</a></p>
      </div>
    `,
    });
  }
}

/** Email the Stripe Checkout URL to the customer (and notify admin). */
export async function sendCustomPayLinkEmail(
  requestId: string,
  checkoutUrl: string,
  orderNumber?: string
): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped custom pay link to",
      (await resolveAdminNotifyEmails()).join(", ")
    );
    return;
  }

  const supabase = createAdminClient();
  const { data: req } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return;

  const amount =
    req.quote_amount_gbp != null
      ? formatGbp(Number(req.quote_amount_gbp))
      : null;
  const resend = getResend();
  const from = emailFrom("custom");
  const replyTo = emailReplyTo();
  const site = getSiteUrl();
  const admins = await adminEmailsFor("custom");
  const quoteNote = req.quote_message
    ? `<p style="margin-top:12px;white-space:pre-wrap;">${escapeHtml(req.quote_message)}</p>`
    : "";

  await resend.emails.send({
    from,
    to: req.email,
    replyTo,
    subject: amount
      ? `Pay your Vivaboss quote — ${amount}`
      : `Pay your Vivaboss custom order`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">Ready to pay</h1>
        <p>Hi ${escapeHtml(req.full_name)},</p>
        <p>Your custom${req.product_name ? ` <strong>${escapeHtml(req.product_name)}</strong>` : ""} quote is ready${amount ? ` for <strong>${amount}</strong>` : ""}.</p>
        ${quoteNote}
        ${orderNumber ? `<p style="color:#666;font-size:13px;">Order reference: <strong>${escapeHtml(orderNumber)}</strong></p>` : ""}
        <p style="margin:28px 0 12px;">
          <a href="${checkoutUrl}" style="display:inline-block;background:#b4532a;color:#fff;text-decoration:none;padding:14px 22px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;">
            Pay securely now
          </a>
        </p>
        <p style="color:#666;font-size:12px;">This is a secure Stripe checkout. If the button doesn’t work, use:<br/><a href="${checkoutUrl}">${checkoutUrl}</a></p>
        <p style="margin-top:24px;color:#666;font-size:13px;">Questions? <a href="${site}/contact">Contact Vivaboss</a>.</p>
      </div>
    `,
  });

  if (admins.length) {
    await resend.emails.send({
      from,
      to: admins,
      replyTo: req.email,
      subject: `Pay link sent — ${req.product_name ?? "Custom"}${amount ? ` · ${amount}` : ""}`,
      html: `
      <div style="font-family:sans-serif;">
        <h2>Custom pay link emailed</h2>
        <p>${escapeHtml(req.full_name)} · ${escapeHtml(req.email)}</p>
        ${amount ? `<p>Amount: ${amount}</p>` : ""}
        ${orderNumber ? `<p>Order: ${escapeHtml(orderNumber)}</p>` : ""}
        <p><a href="${checkoutUrl}">Checkout link</a></p>
        <p><a href="${site}/admin/custom-requests/${req.id}">Open in admin</a></p>
      </div>
    `,
    });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
