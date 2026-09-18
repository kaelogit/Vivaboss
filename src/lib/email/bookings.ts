import {
  adminEmailsFor,
  emailFrom,
  emailReplyTo,
  getResend,
  hasResend,
  resolveAdminNotifyEmails,
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
    const fallback = await resolveAdminNotifyEmails();
    console.warn(
      "[email] RESEND_API_KEY missing — skipped service job notify to",
      fallback.join(", ")
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
  const from = emailFrom("booking");
  const replyTo = emailReplyTo();
  const site = getSiteUrl();
  const admins = await adminEmailsFor("service");
  const typeLabel = labelServiceType(job.job_type);
  const fromCheckout = job.source === "checkout_addon";

  // Customer already gets the order receipt when install is from checkout
  if (!fromCheckout) {
    await resend.emails.send({
      from,
      to: job.email,
      replyTo,
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

  if (admins.length) {
    await resend.emails.send({
      from,
      to: admins,
      replyTo: job.email,
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
}

export async function sendCourierJobEmails(jobId: string): Promise<void> {
  if (!hasResend()) {
    const fallback = await resolveAdminNotifyEmails();
    console.warn(
      "[email] RESEND_API_KEY missing — skipped courier job notify to",
      fallback.join(", ")
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
  const from = emailFrom("courier");
  const replyTo = emailReplyTo();
  const site = getSiteUrl();
  const admins = await adminEmailsFor("courier");
  const vertical = labelCourierVertical(job.vertical);
  const urgency = labelCourierUrgency(job.urgency);

  await resend.emails.send({
    from,
    to: job.email,
    replyTo,
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

  if (admins.length) {
    await resend.emails.send({
      from,
      to: admins,
      replyTo: job.email,
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
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function serviceStatusCopy(status: string): { subject: string; lead: string } {
  switch (status) {
    case "contacted":
      return {
        subject: "We’ve been in touch about your booking",
        lead: "We’ve reviewed your booking and will be in contact (or already have) about next steps.",
      };
    case "scheduled":
      return {
        subject: "Your service visit is scheduled",
        lead: "Your booking has been scheduled. Check your notes or WhatsApp for the agreed window — reply if you need to change it.",
      };
    case "in_progress":
      return {
        subject: "Your service job is in progress",
        lead: "Work on your booking is underway. We’ll update you when it’s complete.",
      };
    case "completed":
      return {
        subject: "Your service job is complete",
        lead: "We’ve marked your booking as complete. Thanks for choosing Vivaboss — reply if anything still needs attention.",
      };
    case "cancelled":
      return {
        subject: "Your service booking was cancelled",
        lead: "Your booking has been cancelled. If this was unexpected, reply to this email or contact us and we’ll help.",
      };
    default:
      return {
        subject: "Update on your service booking",
        lead: `Your booking status is now: ${formatStatus(status)}.`,
      };
  }
}

function courierStatusCopy(status: string): { subject: string; lead: string } {
  switch (status) {
    case "confirmed":
      return {
        subject: "Your courier job is confirmed",
        lead: "We’ve confirmed your courier request and will pick up as arranged.",
      };
    case "picked_up":
      return {
        subject: "Your parcel has been picked up",
        lead: "Your item is with us and on the way to the drop-off address.",
      };
    case "delivered":
      return {
        subject: "Your courier delivery is complete",
        lead: "We’ve marked your delivery as complete. Thanks for using Vivaboss Courier.",
      };
    case "failed":
      return {
        subject: "Update on your courier delivery",
        lead: "We couldn’t complete this delivery as planned. We’ll be in touch (or reply here) to arrange next steps.",
      };
    case "cancelled":
      return {
        subject: "Your courier request was cancelled",
        lead: "Your courier job has been cancelled. Contact us if you need to rebook.",
      };
    default:
      return {
        subject: "Update on your courier request",
        lead: `Your courier status is now: ${formatStatus(status)}.`,
      };
  }
}

/** Customer email when admin changes service job status. */
export async function sendServiceJobStatusEmail(jobId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped service status email"
    );
    return;
  }

  const supabase = createAdminClient();
  const { data: job } = await supabase
    .from("service_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();
  if (!job || job.status === "new") return;

  const copy = serviceStatusCopy(job.status);
  const typeLabel = labelServiceType(job.job_type);
  const site = getSiteUrl();
  const scheduled =
    job.scheduled_at && !Number.isNaN(Date.parse(job.scheduled_at))
      ? new Date(job.scheduled_at).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : null;

  await getResend().emails.send({
    from: emailFrom("booking"),
    replyTo: emailReplyTo(),
    to: job.email,
    subject: `${copy.subject} — Vivaboss`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">${escapeHtml(copy.subject)}</h1>
        <p>Hi ${escapeHtml(job.full_name)},</p>
        <p>${escapeHtml(copy.lead)}</p>
        <p style="margin-top:16px;font-size:14px;color:#444;">
          <strong>${escapeHtml(typeLabel)}</strong>
          ${job.postcode ? ` · ${escapeHtml(job.postcode)}` : ""}
          <br/>Status: <strong>${escapeHtml(formatStatus(job.status))}</strong>
          ${scheduled ? `<br/>Scheduled: ${escapeHtml(scheduled)}` : ""}
        </p>
        <p style="margin-top:24px;color:#666;font-size:13px;">
          Questions? <a href="${site}/contact">Contact Vivaboss</a>.
        </p>
      </div>
    `,
  });
}

/** Customer email when admin changes courier job status. */
export async function sendCourierJobStatusEmail(jobId: string): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped courier status email"
    );
    return;
  }

  const supabase = createAdminClient();
  const { data: job } = await supabase
    .from("courier_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();
  if (!job || job.status === "new") return;

  const copy = courierStatusCopy(job.status);
  const vertical = labelCourierVertical(job.vertical);
  const site = getSiteUrl();

  await getResend().emails.send({
    from: emailFrom("courier"),
    replyTo: emailReplyTo(),
    to: job.email,
    subject: `${copy.subject} — Vivaboss`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">${escapeHtml(copy.subject)}</h1>
        <p>Hi ${escapeHtml(job.full_name)},</p>
        <p>${escapeHtml(copy.lead)}</p>
        <p style="margin-top:16px;font-size:14px;color:#444;">
          <strong>${escapeHtml(vertical)}</strong> · ${escapeHtml(labelCourierUrgency(job.urgency))}
          <br/>Status: <strong>${escapeHtml(formatStatus(job.status))}</strong>
          <br/>${escapeHtml(job.pickup_postcode)} → ${escapeHtml(job.dropoff_postcode)}
        </p>
        <p style="margin-top:24px;color:#666;font-size:13px;">
          Questions? <a href="${site}/contact">Contact Vivaboss</a>.
        </p>
      </div>
    `,
  });
}
