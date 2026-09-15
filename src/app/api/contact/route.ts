import { NextResponse } from "next/server";
import { contactTopics } from "@/lib/content/marketing";

type Body = {
  fullName: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
};

const TOPIC_VALUES = contactTopics.map((t) => t.value) as readonly string[];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    if (
      !body.fullName?.trim() ||
      !body.email?.trim() ||
      !body.message?.trim() ||
      !body.topic?.trim()
    ) {
      return NextResponse.json(
        { error: "Name, email, topic, and message are required." },
        { status: 400 }
      );
    }
    if (!TOPIC_VALUES.includes(body.topic)) {
      return NextResponse.json({ error: "Invalid topic." }, { status: 400 });
    }

    try {
      const { sendContactEmails } = await import("@/lib/email/contact");
      await sendContactEmails({
        fullName: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        topic: body.topic,
        message: body.message.trim(),
      });
    } catch (err) {
      console.error("contact email failed", err);
      const message =
        err instanceof Error
          ? err.message
          : "Could not send message. Try emailing us directly.";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
