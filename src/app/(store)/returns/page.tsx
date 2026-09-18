import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Returns & Refunds",
  description: `Returns and refunds for personalised and standard products from ${siteConfig.name}.`,
};

export default function ReturnsPage() {
  return (
    <main>
      <SectionIntro
        eyebrow="Legal"
        title="Returns & Refunds"
        description="Personalised pieces are made just for you, so we can’t take them back for a change of mind. If we get something wrong, or your order arrives damaged, we’ll put it right."
      />
      <div className="vb-container max-w-3xl space-y-10 py-12 text-sm leading-relaxed text-vb-muted sm:py-16 sm:text-[15px]">
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Made-to-order items
          </h2>
          <p className="mt-3">
            Most of what we sell is custom-made to your specifications. Under UK
            consumer law, personalised goods are exempt from the usual 14-day
            cancellation right — once your design is engraved or printed, the
            item can’t be resold.
          </p>
          <p className="mt-3">
            Please check artwork, spelling, names, dates, and sizes carefully
            before you approve your proof. We recommend reading names and dates
            out loud, and showing the proof to someone else. We engrave or print
            exactly what you approve.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            If we make a mistake
          </h2>
          <p className="mt-3">
            If your item doesn’t match the proof you approved — wrong spelling,
            wrong placement, or the wrong product — that’s on us. Within 14 days
            of delivery, contact us with your order number and a photo of the
            item. You can choose:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>A free replacement, shipped at no cost to you, or</li>
            <li>A full refund to your original payment method</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            If the item arrives damaged
          </h2>
          <p className="mt-3">
            If your order arrives damaged, contact us within 7 days of delivery
            with photos of the item and the packaging. We’ll arrange a
            replacement or full refund straight away. Keeping the original
            packaging helps us claim with the courier.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            If you made a mistake
          </h2>
          <p className="mt-3">
            Approved a typo, wrong date, or wrong size? Because we produce
            exactly what you signed off, we can’t offer a refund for errors in
            artwork you approved. That said, we know how much these gifts mean —
            contact us anyway. Where we can, we’ll offer a remake at a reduced
            price as a goodwill gesture. We can’t promise every time, but we’ll
            always try to help.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Artwork quality
          </h2>
          <p className="mt-3">
            We work from the artwork you send. If the source file is
            low-resolution or poor quality, the finished engraving will reflect
            that. We’ll flag concerns on your proof before production so you can
            approve it knowing exactly how it will look. Full details:{" "}
            <Link
              href="/artwork-guidelines"
              className="text-vb-accent underline-offset-2 hover:underline"
            >
              Artwork guidelines
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Non-personalised items
          </h2>
          <p className="mt-3">
            Changed your mind on a standard, non-personalised product? Return it
            unused and in its original packaging within 14 days for a full
            refund. Return postage is your responsibility.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            How to get in touch
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Email or message us with your order number, the issue, and photos
              of the item —{" "}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-vb-accent underline-offset-2 hover:underline"
              >
                {siteConfig.contact.email}
              </a>{" "}
              or{" "}
              <Link
                href="/contact"
                className="text-vb-accent underline-offset-2 hover:underline"
              >
                Contact
              </Link>
            </li>
            <li>We’ll reply within 2 working days</li>
            <li>Approved replacements are dispatched within 5 working days</li>
          </ul>
        </section>

        <p className="border-t border-vb-line pt-8 text-xs text-vb-muted">
          Last updated: 17 September 2026. See also{" "}
          <Link
            href="/terms"
            className="text-vb-accent underline-offset-2 hover:underline"
          >
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
