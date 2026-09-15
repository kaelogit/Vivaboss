import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { CourierUrgency, CourierVertical } from "@/types/database";
import { assertUkPostcode } from "@/lib/uk/postcode";

const VERTICALS: CourierVertical[] = [
  "medical",
  "flowers_events",
  "legal",
  "general",
];
const URGENCIES: CourierUrgency[] = ["standard", "same_day", "urgent"];

type Body = {
  vertical: CourierVertical;
  urgency: CourierUrgency;
  itemDescription: string;
  notes?: string;
  photos?: string[];
  pickupLine1: string;
  pickupLine2?: string;
  pickupCity?: string;
  pickupPostcode: string;
  dropoffLine1: string;
  dropoffLine2?: string;
  dropoffCity?: string;
  dropoffPostcode: string;
  preferredWindow?: string;
  fullName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
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
      !body.itemDescription?.trim() ||
      !body.pickupLine1?.trim() ||
      !body.pickupPostcode?.trim() ||
      !body.dropoffLine1?.trim() ||
      !body.dropoffPostcode?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Name, email, item details, and pickup/drop-off addresses are required.",
        },
        { status: 400 }
      );
    }
    if (!VERTICALS.includes(body.vertical)) {
      return NextResponse.json({ error: "Invalid vertical." }, { status: 400 });
    }
    if (!URGENCIES.includes(body.urgency)) {
      return NextResponse.json({ error: "Invalid urgency." }, { status: 400 });
    }

    let pickupPostcode: string;
    let dropoffPostcode: string;
    try {
      pickupPostcode = assertUkPostcode(body.pickupPostcode);
      dropoffPostcode = assertUkPostcode(body.dropoffPostcode);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid postcode." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("courier_jobs")
      .insert({
        vertical: body.vertical,
        urgency: body.urgency,
        item_description: body.itemDescription.trim(),
        notes: body.notes?.trim() || null,
        photos: body.photos ?? [],
        pickup_line1: body.pickupLine1.trim(),
        pickup_line2: body.pickupLine2?.trim() || null,
        pickup_city: body.pickupCity?.trim() || null,
        pickup_postcode: pickupPostcode,
        dropoff_line1: body.dropoffLine1.trim(),
        dropoff_line2: body.dropoffLine2?.trim() || null,
        dropoff_city: body.dropoffCity?.trim() || null,
        dropoff_postcode: dropoffPostcode,
        preferred_window: body.preferredWindow?.trim() || null,
        full_name: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        whatsapp: body.whatsapp?.trim() || null,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      const { sendCourierJobEmails } = await import("@/lib/email/bookings");
      await sendCourierJobEmails(data.id);
    } catch (err) {
      console.error("courier job email failed", err);
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
