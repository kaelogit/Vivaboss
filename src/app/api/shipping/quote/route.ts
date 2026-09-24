import { NextResponse } from "next/server";
import { assertUkPostcode, isValidUkPostcode } from "@/lib/uk/postcode";
import { quoteUkShipping } from "@/lib/shipping/quote";

/** Public shipping preview — same rates checkout will charge. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const subtotal = Number(url.searchParams.get("subtotal") ?? "");
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: "Invalid subtotal." }, { status: 400 });
  }

  const raw = url.searchParams.get("postcode")?.trim() ?? "";
  let postcode: string | null = null;
  if (raw) {
    if (!isValidUkPostcode(raw)) {
      return NextResponse.json(
        { error: "Enter a valid UK postcode." },
        { status: 400 }
      );
    }
    postcode = assertUkPostcode(raw);
  }

  const quote = await quoteUkShipping(subtotal, postcode);
  return NextResponse.json({
    ...quote,
    postcodeApplied: Boolean(postcode),
  });
}
