import Link from "next/link";
import SectionIntro from "@/components/store/SectionIntro";
import ContactForm from "@/components/store/ContactForm";
import { marketingImages } from "@/lib/content/marketingImages";
import { getPublicPages } from "@/lib/content/siteSettings";
import { whatsappHref } from "@/lib/navigation";
import { isContactLive, isWhatsAppLive, siteConfig } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description:
    "Email, phone, WhatsApp, and message Vivaboss Fusion Services — shop, services, and courier.",
};

export default async function ContactPage() {
  const pages = await getPublicPages();
  const { phone, email, address } = siteConfig.contact;
  const waLive = isWhatsAppLive();
  const phoneLive = isContactLive() && !phone.includes("0000");

  return (
    <main>
      <SectionIntro
        eyebrow="Contact"
        title="Talk to Vivaboss"
        description={
          pages.contactIntro ||
          "Questions about an order, a custom piece, a home visit, or a courier run — reach us here. Bookings also have dedicated forms if you already know what you need."
        }
        image={marketingImages.craft.materials}
        imageAlt="Vivaboss craft materials"
      />

      <div className="vb-container py-12 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="vb-eyebrow">Details</p>
            <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight">
              How to reach us
            </h2>

            <ul className="mt-10 space-y-8">
              <li>
                <p className="vb-eyebrow">Email</p>
                <a
                  href={`mailto:${email}`}
                  className="mt-2 block text-lg text-vb-ink hover:text-vb-accent"
                >
                  {email}
                </a>
              </li>
              <li>
                <p className="vb-eyebrow">Phone</p>
                {phoneLive ? (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="mt-2 block text-lg text-vb-ink hover:text-vb-accent"
                  >
                    {phone}
                  </a>
                ) : (
                  <p className="mt-2 text-lg text-vb-muted">
                    Confirmed at launch — email or the form for now.
                  </p>
                )}
              </li>
              <li>
                <p className="vb-eyebrow">WhatsApp</p>
                {waLive ? (
                  <a
                    href={whatsappHref("Hi Vivaboss — ")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex h-11 items-center bg-vb-accent px-5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover"
                  >
                    Open WhatsApp
                  </a>
                ) : (
                  <p className="mt-2 text-lg text-vb-muted">
                    Goes live when the client number is set.
                  </p>
                )}
              </li>
              <li>
                <p className="vb-eyebrow">Based in</p>
                <p className="mt-2 text-lg text-vb-ink">{address}</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-vb-muted">
                  Shop fulfilment, home & smart services, and courier runs cover
                  the United Kingdom. Include your postcode so we can respond
                  with the right next step.
                </p>
              </li>
            </ul>

            <div className="mt-12 border-t border-vb-line pt-8">
              <p className="vb-eyebrow">Faster paths</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/services/book" className="text-vb-accent hover:underline">
                    Book a service →
                  </Link>
                </li>
                <li>
                  <Link href="/courier/book" className="text-vb-accent hover:underline">
                    Book a courier →
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-vb-accent hover:underline">
                    Read the FAQ →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </main>
  );
}
