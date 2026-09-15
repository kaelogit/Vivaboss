import {
  adminNotifyEmails,
  emailFrom,
  getResend,
  hasResend,
} from "@/lib/email/client";
import {
  formatStatus,
  labelCourierUrgency,
  labelCourierVertical,
  labelServiceType,
} from "@/lib/bookings/labels";
import { getSiteUrl } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function sendServiceJobEmails(jobId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped service job notify to",
      adminNotifyEmails().join(", ")
    );
    return;
  }

  const supabase = createAdminClient();
  const { data: job } = await supabase
    .from("service_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();
  if (!job) return;

  const resend = getResend();
  const from = emailFrom();
  const site = getSiteUrl();
  const admins = adminNotifyEmails();
  const typeLabel = labelServiceType(job.job_type);
  const fromCheckout = job.source === "checkout_addon";

  // Customer already gets the order receipt when install is from checkout
  if (!fromCheckout) {
    await resend.emails.send({
      from,
      to: job.email,
      subject: "We received your service booking — Vivaboss",
      html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">Booking received</h1>
        <p>Thanks ${job.full_name}. We’ve logged your request for <strong>${typeLabel}</strong>${job.postcode ? ` in <strong>${job.postcode}</strong>` : ""}.</p>
        <p style="color:#666;font-size:14px;">We’ll confirm availability and next steps shortly.</p>
      </div>
    `,
    });
  }

  await resend.emails.send({
    from,
    to: admins,
    subject: fromCheckout
      ? `Install job (checkout) — ${typeLabel} · ${job.postcode}`
      : `Service job — ${typeLabel} · ${job.postcode}`,
    html: `
        <div style="font-family:sans-serif;">
          <h2>${fromCheckout ? "New install from order" : "New service job"}</h2>
          <p>${job.full_name} · ${job.email}${job.phone ? ` · ${job.phone}` : ""}</p>
          <p>Type: ${typeLabel}<br/>Postcode: ${job.postcode}<br/>Window: ${job.preferred_window ?? "—"}<br/>Source: ${job.source}</p>
          <p>${job.description ?? ""}</p>
          <p><a href="${site}/admin/service-jobs/${job.id}">Open in admin</a></p>
        </div>
      `,
  });
}

export async function sendCourierJobEmails(jobId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped courier job notify to",
      adminNotifyEmails().join(", ")
    );
    return;
  }

  const supabase = createAdminClient();
  const { data: job } = await supabase
    .from("courier_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();
  if (!job) return;

  const resend = getResend();
  const from = emailFrom();
  const site = getSiteUrl();
  const admins = adminNotifyEmails();
  const vertical = labelCourierVertical(job.vertical);
  const urgency = labelCourierUrgency(job.urgency);

  await resend.emails.send({
    from,
    to: job.email,
    subject: "We received your courier request — Vivaboss",
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">Courier request received</h1>
        <p>Thanks ${job.full_name}. We’ve logged your <strong>${vertical}</strong> delivery (${urgency}).</p>
        <p style="color:#666;font-size:14px;">Pickup ${job.pickup_postcode} → drop-off ${job.dropoff_postcode}. We’ll confirm shortly.</p>
      </div>
    `,
  });

  await resend.emails.send({
    from,
    to: admins,
    subject: `Courier job — ${vertical} · ${urgency}`,
    html: `
        <div style="font-family:sans-serif;">
          <h2>New courier job</h2>
          <p>${job.full_name} · ${job.email}${job.phone ? ` · ${job.phone}` : ""}</p>
          <p>Status: ${formatStatus(job.status)} · ${vertical} · ${urgency}</p>
          <p>Pickup: ${job.pickup_line1}, ${job.pickup_postcode}<br/>
             Drop-off: ${job.dropoff_line1}, ${job.dropoff_postcode}</p>
          <p>${job.item_description}</p>
          <p><a href="${site}/admin/courier-jobs/${job.id}">Open in admin</a></p>
        </div>
      `,
  });
}
