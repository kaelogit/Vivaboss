import { Suspense } from "react";
import SectionIntro from "@/components/store/SectionIntro";
import CourierBookingForm from "@/components/bookings/CourierBookingForm";
import type { CourierVertical } from "@/types/database";

export const metadata = {
  title: "Book a Delivery",
  description:
    "Request a Vivaboss courier pickup and delivery across the UK — medical, legal, flowers, and general.",
};

const VERTICALS: CourierVertical[] = [
  "medical",
  "flowers_events",
  "legal",
  "general",
];

function FormFromSearch({
  searchParams,
}: {
  searchParams: { vertical?: string };
}) {
  const raw = searchParams.vertical;
  const initialVertical =
    raw && VERTICALS.includes(raw as CourierVertical)
      ? (raw as CourierVertical)
      : "general";
  return <CourierBookingForm initialVertical={initialVertical} />;
}

export default async function BookCourierPage({
  searchParams,
}: {
  searchParams: Promise<{ vertical?: string }>;
}) {
  const params = await searchParams;

  return (
    <main>
      <SectionIntro
        eyebrow="Courier"
        title="Book a delivery"
        description="Pickup, drop-off, urgency, and item details — we confirm timing and care requirements by email."
      />
      <div className="vb-container max-w-4xl py-12 sm:py-16">
        <Suspense
          fallback={
            <p className="text-sm text-vb-muted">Loading booking form…</p>
          }
        >
          <FormFromSearch searchParams={params} />
        </Suspense>
      </div>
    </main>
  );
}
