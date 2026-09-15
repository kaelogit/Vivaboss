import { formatGbp } from "@/lib/products/money";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminNotifyEmails,
  emailFrom,
  getResend,
  hasResend,
} from "@/lib/email/client";
import { getSiteUrl } from "@/lib/stripe";

export async function sendOrderEmails(orderId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped order notify to",
      adminNotifyEmails().join(", ")
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
  const from = emailFrom();

  await resend.emails.send({
    from,
    to: order.email,
    subject: `Order ${order.order_number} confirmed — Vivaboss`,
    html: htmlCustomer,
  });

  const admins = adminNotifyEmails();
  await resend.emails.send({
    from,
    to: admins,
    subject: `New order ${order.order_number}`,
    html: htmlAdmin,
  });
}

export async function sendCustomRequestEmails(requestId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped custom request notify to",
      adminNotifyEmails().join(", ")
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
  const from = emailFrom();
  const site = getSiteUrl();
  const admins = adminNotifyEmails();

  await resend.emails.send({
    from,
    to: req.email,
    subject: `We received your custom request — Vivaboss`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">Request received</h1>
        <p>Thanks ${req.full_name}. We’ll review${req.product_name ? ` your request for <strong>${req.product_name}</strong>` : ""} and come back with a quote.</p>
      </div>
    `,
  });

  await resend.emails.send({
    from,
    to: admins,
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

export async function sendCustomQuoteEmail(requestId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped custom quote notify to",
      adminNotifyEmails().join(", ")
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
  const from = emailFrom();
  const site = getSiteUrl();
  const admins = adminNotifyEmails();
  const quoteNote = req.quote_message
    ? `<p style="margin-top:16px;white-space:pre-wrap;">${req.quote_message}</p>`
    : "";

  await resend.emails.send({
    from,
    to: req.email,
    subject: `Your Vivaboss quote — ${amount}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">Your custom quote</h1>
        <p>Hi ${req.full_name},</p>
        <p>We’ve prepared a quote${req.product_name ? ` for <strong>${req.product_name}</strong>` : ""}:</p>
        <p style="font-size:28px;font-weight:600;margin:20px 0;">${amount}</p>
        ${quoteNote}
        <p style="margin-top:24px;color:#666;font-size:13px;">Reply to this email or contact us via <a href="${site}/contact">${site.replace(/^https?:\/\//, "")}/contact</a> if you’d like to proceed.</p>
      </div>
    `,
  });

  await resend.emails.send({
    from,
    to: admins,
    subject: `Quote sent — ${req.product_name ?? "Custom"} · ${amount}`,
    html: `
      <div style="font-family:sans-serif;">
        <h2>Custom quote emailed</h2>
        <p>${req.full_name} · ${req.email}</p>
        <p>Amount: ${amount}</p>
        ${req.quote_message ? `<p>${req.quote_message}</p>` : ""}
        <p><a href="${site}/admin/custom-requests/${req.id}">Open in admin</a></p>
      </div>
    `,
  });
}
