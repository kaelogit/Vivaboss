import { NextResponse } from "next/server";
import { assertUkPostcode, isValidUkPostcode } from "@/lib/uk/postcode";
import { quoteUkShipping } from "@/lib/shipping/quote";
import { resolveCollectionPoint } from "@/lib/shipping/fulfillment";
import type { FulfillmentMethod } from "@/lib/shipping/fulfillment";

/** Public shipping preview — same rates checkout will charge. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const subtotal = Number(url.searchParams.get("subtotal") ?? "");
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: "Invalid subtotal." }, { status: 400 });
  }

  const methodParam = url.searchParams.get("method");
  const method: FulfillmentMethod =
    methodParam === "collection" ? "collection" : "delivery";

  const raw = url.searchParams.get("postcode")?.trim() ?? "";
  let postcode: string | null = null;
  if (raw && method === "delivery") {
    if (!isValidUkPostcode(raw)) {
      return NextResponse.json(
        { error: "Enter a valid UK postcode." },
        { status: 400 }
      );
    }
    postcode = assertUkPostcode(raw);
  }

  const quote = await quoteUkShipping(subtotal, postcode, method);
  const collectionPoint =
    quote.collectionEnabled ? await resolveCollectionPoint() : null;

  return NextResponse.json({
    shippingGbp: quote.shippingGbp,
    bandLabel: quote.bandLabel,
    totalGbp: quote.totalGbp,
    method: quote.method,
    collectionEnabled: quote.collectionEnabled,
    collectionLabel: collectionPoint?.label ?? null,
    postcodeApplied: Boolean(postcode),
  });
}
