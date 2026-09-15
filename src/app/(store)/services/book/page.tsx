import { Suspense } from "react";
import SectionIntro from "@/components/store/SectionIntro";
import ServiceBookingForm from "@/components/bookings/ServiceBookingForm";
import type { ServiceJobType } from "@/types/database";

export const metadata = {
  title: "Book a Service",
  description:
    "Request a Vivaboss home repair or smart-home installation across the UK.",
};

const TYPES: ServiceJobType[] = [
  "home_repair",
  "smart_home_install",
  "other",
];

function FormFromSearch({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const raw = searchParams.type;
  const initialType =
    raw && TYPES.includes(raw as ServiceJobType)
      ? (raw as ServiceJobType)
      : "home_repair";
  return <ServiceBookingForm initialType={initialType} />;
}

export default async function BookServicePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;

  return (
    <main>
      <SectionIntro
        eyebrow="Services"
        title="Book a service"
        description="Tell us the job, postcode, and preferred window. We confirm by email — WhatsApp if you prefer."
      />
      <div className="vb-container max-w-3xl py-12 sm:py-16">
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
