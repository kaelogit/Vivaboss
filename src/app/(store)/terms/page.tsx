import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Terms of Service",
  description: `Terms for shopping, booking services, and courier jobs with ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <main>
      <SectionIntro
        eyebrow="Legal"
        title="Terms of Service"
        description={`Last updated: 14 March 2026. These terms govern use of vivabossfusion.co.uk and purchases/bookings with ${siteConfig.name}.`}
      />
      <div className="vb-container max-w-3xl space-y-10 py-12 text-sm leading-relaxed text-vb-muted sm:py-16 sm:text-[15px]">
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            1. About us
          </h2>
          <p className="mt-3">
            {siteConfig.name} supplies handmade fashion and personalised goods,
            smart-home and DIY products, home and smart-home services, and
            courier delivery across the United Kingdom. Contact:{" "}
            {siteConfig.contact.email}.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            2. Shop orders
          </h2>
          <p className="mt-3">
            Prices are in GBP and include VAT where applicable unless stated.
            Payment is taken via Stripe at checkout. A contract forms when we
            accept your order (usually on payment confirmation). We may cancel
            and refund if stock, personalisation, or fraud checks fail.
          </p>
          <p className="mt-3">
            Personalised or made-to-order items may have longer lead times and
            limited cancellation rights once production has started. Custom
            requests requiring approval are quotes until you accept and pay.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            3. Delivery (shop)
          </h2>
          <p className="mt-3">
            We ship UK-wide. Shipping rates may vary by postcode band (e.g.
            Highlands & Islands, Northern Ireland). Estimated dates are
            indicative, not guarantees.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            4. Services & courier
          </h2>
          <p className="mt-3">
            Booking forms request a job; they are not an instant confirmation of
            a visit or run. We confirm timing, access, and any charges by email
            or WhatsApp. You must provide accurate addresses, postcodes, and
            handling notes. Dangerous, illegal, or prohibited items cannot be
            carried.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            5. Consumer rights
          </h2>
          <p className="mt-3">
            Nothing in these terms affects your statutory rights under UK
            consumer law. For most non-personalised goods you may have a cooling-off
            period for distance sales; personalised goods are typically exempt
            once customisation begins. For the full returns process, see our{" "}
            <Link
              href="/returns"
              className="text-vb-accent underline-offset-2 hover:underline"
            >
              Returns &amp; Refunds
            </Link>{" "}
            policy. Contact us promptly about faults.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            6. Liability
          </h2>
          <p className="mt-3">
            We provide services and products with reasonable care. We are not
            liable for indirect or consequential loss. Our total liability for
            any claim relating to an order or booking is limited to the amount
            paid for that order or booking, except where liability cannot be
            limited by law (including death or personal injury caused by
            negligence, or fraud).
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            7. Acceptable use
          </h2>
          <p className="mt-3">
            Do not misuse the site, upload unlawful content, attempt unauthorised
            access, or submit abusive bookings. We may suspend access where
            necessary.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            8. Governing law
          </h2>
          <p className="mt-3">
            These terms are governed by the laws of England and Wales. Courts of
            England and Wales have exclusive jurisdiction, without prejudice to
            mandatory consumer protections in your UK nation of residence.
          </p>
        </section>
        <p>
          Questions?{" "}
          <Link href="/contact" className="text-vb-accent">
            Contact us
          </Link>{" "}
          or read our{" "}
          <Link href="/privacy" className="text-vb-accent">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-xs text-vb-muted">
          Need clarification on an order or booking?{" "}
          <Link href="/contact" className="text-vb-accent">
            Contact us
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
