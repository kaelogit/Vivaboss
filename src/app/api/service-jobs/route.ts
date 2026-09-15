import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { ServiceJobType } from "@/types/database";
import { assertUkPostcode } from "@/lib/uk/postcode";

const TYPES: ServiceJobType[] = [
  "home_repair",
  "smart_home_install",
  "other",
];

type Body = {
  jobType: ServiceJobType;
  specificService?: string;
  description?: string;
  photos?: string[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode: string;
  preferredWindow?: string;
  fullName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  relatedOrderId?: string;
};

export async function POST(request: Request) {
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Bookings are not configured yet (Supabase)." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as Body;
    if (
      !body.fullName?.trim() ||
      !body.email?.trim() ||
      !body.postcode?.trim()
    ) {
      return NextResponse.json(
        { error: "Name, email, and postcode are required." },
        { status: 400 }
      );
    }
    if (!TYPES.includes(body.jobType)) {
      return NextResponse.json({ error: "Invalid service type." }, { status: 400 });
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

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("service_jobs")
      .insert({
        job_type: body.jobType,
        specific_service: body.specificService?.trim() || null,
        description: body.description?.trim() || null,
        photos: body.photos ?? [],
        address_line1: body.addressLine1?.trim() || null,
        address_line2: body.addressLine2?.trim() || null,
        city: body.city?.trim() || null,
        postcode,
        preferred_window: body.preferredWindow?.trim() || null,
        full_name: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        whatsapp: body.whatsapp?.trim() || null,
        related_order_id: body.relatedOrderId || null,
        source: "website",
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      const { sendServiceJobEmails } = await import("@/lib/email/bookings");
      await sendServiceJobEmails(data.id);
    } catch (err) {
      console.error("service job email failed", err);
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
