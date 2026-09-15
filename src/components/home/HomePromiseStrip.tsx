const promises = [
  {
    label: "UK-wide",
    body: "Shop, service visits, and courier runs across the United Kingdom.",
  },
  {
    label: "Craft standard",
    body: "Handmade fashion and personalised pieces with the same care as every install.",
  },
  {
    label: "Book online",
    body: "Request a visit or delivery, then confirm by email — WhatsApp when live.",
  },
  {
    label: "Clear checkout",
    body: "Pay in GBP with clear totals, shipping, and next steps before you confirm.",
  },
] as const;

/**
 * Continuation of the hero ink field — pulled up into the fade so
 * image → promises reads as one band, not two stacked blocks.
 */
export default function HomePromiseStrip() {
  return (
    <section className="relative z-10 -mt-20 border-b border-white/10 bg-vb-ink sm:-mt-24 lg:-mt-28">
      <div className="vb-container pb-12 pt-6 sm:pb-14 sm:pt-8 lg:pt-10">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {promises.map((item, i) => (
            <li
              key={item.label}
              className="max-w-xs"
              data-vb-reveal="up"
              data-vb-reveal-delay={i * 80}
            >
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-vb-accent">
                {item.label}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-white/55">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
