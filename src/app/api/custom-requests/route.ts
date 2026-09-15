import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

type Body = {
  productId?: string;
  productName?: string;
  fullName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  message?: string;
  preferredMaterial?: string;
  instructions?: string;
  uploads?: string[];
  fieldSnapshot?: Json;
};

export async function POST(request: Request) {
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Requests are not configured yet (Supabase)." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as Body;
    if (!body.fullName?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("custom_requests")
      .insert({
        product_id: body.productId || null,
        product_name: body.productName?.trim() || null,
        full_name: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        whatsapp: body.whatsapp?.trim() || null,
        message: body.message?.trim() || null,
        preferred_material: body.preferredMaterial?.trim() || null,
        instructions: body.instructions?.trim() || null,
        uploads: body.uploads ?? [],
        field_snapshot: body.fieldSnapshot ?? {},
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      const { sendCustomRequestEmails } = await import("@/lib/email/orders");
      await sendCustomRequestEmails(data.id);
    } catch (err) {
      console.error("custom request email failed", err);
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
