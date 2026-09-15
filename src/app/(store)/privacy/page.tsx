import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects and uses your personal data.`,
};

export default function PrivacyPage() {
  return (
    <main>
      <SectionIntro
        eyebrow="Legal"
        title="Privacy Policy"
        description={`Last updated: 14 March 2026. This policy explains how ${siteConfig.name} (“we”, “us”) handles personal data when you use vivabossfusion.co.uk.`}
      />
      <div className="vb-container max-w-3xl space-y-10 py-12 text-sm leading-relaxed text-vb-muted sm:py-16 sm:text-[15px]">
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Who we are
          </h2>
          <p className="mt-3">
            Controller: {siteConfig.name}, United Kingdom. Contact:{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-vb-accent"
            >
              {siteConfig.contact.email}
            </a>
            . Operational notices also go to admin@vivabossfusion.co.uk.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            What we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Identity and contact data (name, email, phone, WhatsApp, address,
              postcode) when you order, book, or message us.
            </li>
            <li>
              Order and booking details, customisation instructions, and any
              photos or files you upload.
            </li>
            <li>
              Payment references processed by Stripe (we do not store full card
              numbers).
            </li>
            <li>
              Technical data such as IP address and basic device/browser info
              from hosting and security logs.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Why we use it
          </h2>
          <p className="mt-3">
            To fulfil contracts (orders, installs, courier jobs), respond to
            enquiries and quotes, send transactional email, improve the site,
            prevent fraud, and meet legal obligations. Lawful bases include
            contract, legitimate interests, and legal obligation.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Sharing
          </h2>
          <p className="mt-3">
            We use processors such as Supabase (database/auth/storage), Stripe
            (payments), Resend (email), and Vercel (hosting). They process data
            on our instructions. We do not sell your personal data.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Retention & security
          </h2>
          <p className="mt-3">
            We keep order and booking records as long as needed for fulfilment,
            accounting, and disputes, then delete or anonymise where practical.
            Access is limited to authorised operators. Uploaded files are stored
            in a private bucket and accessed via signed links.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Your rights
          </h2>
          <p className="mt-3">
            Under UK GDPR you may request access, correction, deletion,
            restriction, portability, or object to certain processing. Contact
            us to exercise these rights. You may complain to the ICO (
            <a
              href="https://ico.org.uk"
              className="text-vb-accent"
              target="_blank"
              rel="noreferrer"
            >
              ico.org.uk
            </a>
            ).
          </p>
        </section>
        <section>
          <h2 className="font-heading text-base font-semibold uppercase tracking-tight text-vb-ink">
            Cookies
          </h2>
          <p className="mt-3">
            We use essential cookies for session/auth and checkout. Analytics
            cookies, if added later, will be disclosed and consented where
            required.
          </p>
        </section>
        <p>
          Prefer a human?{" "}
          <Link href="/contact" className="text-vb-accent">
            Contact us
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
