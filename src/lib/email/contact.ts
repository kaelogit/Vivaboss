import {
  adminNotifyEmails,
  emailFrom,
  getResend,
  hasResend,
} from "@/lib/email/client";
import { getSiteUrl } from "@/lib/stripe";

export async function sendContactEmails(input: {
  fullName: string;
  email: string;
  phone?: string | null;
  topic: string;
  message: string;
}): Promise<void> {
  if (!hasResend()) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipped contact notify to",
      adminNotifyEmails().join(", ")
    );
    throw new Error("Email is not configured (RESEND_API_KEY).");
  }

  const resend = getResend();
  const from = emailFrom();
  const site = getSiteUrl();
  const admins = adminNotifyEmails();

  await resend.emails.send({
    from,
    to: input.email,
    subject: "We received your message — Vivaboss",
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;color:#121110;">
        <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#b4532a;">Vivaboss Fusion</p>
        <h1 style="font-size:22px;">Message received</h1>
        <p>Thanks ${input.fullName}. We’ve got your note and will reply as soon as we can.</p>
      </div>
    `,
  });

  await resend.emails.send({
    from,
    to: admins,
    replyTo: input.email,
    subject: `Contact — ${input.topic} · ${input.fullName}`,
    html: `
        <div style="font-family:sans-serif;">
          <h2>New contact message</h2>
          <p>${input.fullName} · ${input.email}${input.phone ? ` · ${input.phone}` : ""}</p>
          <p>Topic: ${input.topic}</p>
          <p style="white-space:pre-wrap;">${input.message}</p>
          <p><a href="${site}/admin">Open admin</a></p>
        </div>
      `,
  });
}
