import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Laser Engraving Artwork Guidelines",
  description: `How to send artwork for laser engraving with ${siteConfig.name} — what we can work with, materials, and how proofs work.`,
};

export default function ArtworkGuidelinesPage() {
  return (
    <main>
      <SectionIntro
        eyebrow="Personalised"
        title="Artwork guidelines"
        description="Send your artwork promptly so we can process your order without delay. Don’t have a finished file? Get in touch — we can create or convert a design for you."
      />
      <div className="vb-container max-w-3xl space-y-10 py-12 text-sm leading-relaxed text-vb-muted sm:py-16 sm:text-[15px]">
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            About our equipment
          </h2>
          <p className="mt-3">
            Your items are personalised on our laser engraver, which delivers a
            crisp, high-contrast finish. The maximum working area is{" "}
            <span className="text-vb-ink">410 × 420mm</span>. With our 4-in-1
            rotary attachment, we can also engrave round and irregularly shaped
            objects in full 360°.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Got a picture? We’ve got you
          </h2>
          <p className="mt-3">
            No design skills needed. Send a photo, logo, name, or even a rough
            idea — our team handles the editing for laser engraving.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            How it works
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li>
              <span className="text-vb-ink">Send us anything</span> — a photo
              from your phone, a screenshot, a logo, handwritten text, or a
              short description of what you want.
            </li>
            <li>
              <span className="text-vb-ink">We prepare it</span> — clean it up,
              remove backgrounds where needed, sharpen detail, and format it for
              engraving.
            </li>
            <li>
              <span className="text-vb-ink">You approve a free preview</span> —
              before we touch your item, you get a visual proof showing exactly
              how it will look.
            </li>
            <li>
              <span className="text-vb-ink">We engrave it</span> — on flat
              products or curved ones (tumblers, bottles, glasses). Our rotary
              setup engraves 360° around them.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            What we can work with
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Photos</li>
            <li>Names and quotes</li>
            <li>Logos</li>
            <li>Your own artwork</li>
            <li>A rough idea (for example: “like this, but with our logo”)</li>
          </ul>
          <p className="mt-3">
            If your picture is blurry, low-resolution, or not quite right, we’ll
            tell you. We can rebuild it for you at a small extra charge when
            needed. Most everyday phone photos work fine.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            What we engrave on
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Wood</li>
            <li>Tumblers, flasks and bottles (stainless steel and glass)</li>
            <li>Mugs and glasses</li>
            <li>Leather</li>
            <li>Ceramic</li>
            <li>Anodised aluminium</li>
            <li>Acrylic, card, and more</li>
          </ul>
          <p className="mt-3">
            We cannot process PVC, vinyl, or any unknown or chlorinated plastics
            — these release toxic fumes and can damage equipment.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Need help with artwork?
          </h2>
          <p className="mt-3">
            Email or message us with your idea or files —{" "}
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
            . For returns and proof mistakes, see{" "}
            <Link
              href="/returns"
              className="text-vb-accent underline-offset-2 hover:underline"
            >
              Returns &amp; Refunds
            </Link>
            .
          </p>
        </section>

        <p className="border-t border-vb-line pt-8 text-xs text-vb-muted">
          Last updated: 17 September 2026.
        </p>
      </div>
    </main>
  );
}
