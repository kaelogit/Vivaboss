const pillars = [
  {
    title: "Culture in the craft",
    body: "Fashion and personalised pieces carry African creativity into modern UK life — made to look good, feel special, and last.",
  },
  {
    title: "Clarity in the booking",
    body: "Services and courier runs start with clear forms, postcodes, and confirmation — so you always know what happens next.",
  },
  {
    title: "Care in the handover",
    body: "Whether it’s a leather bag, a lock install, or a medical pouch, the same careful standard travels with every order.",
  },
] as const;

export default function HomeTrust() {
  return (
    <section className="border-b border-vb-line bg-vb-paper py-20 sm:py-24">
      <div className="vb-container">
        <div data-vb-reveal="up">
          <p className="vb-eyebrow">Why Vivaboss</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Built to feel finished
          </h2>
        </div>
        <ul className="mt-12 grid gap-0 border-t border-vb-line md:grid-cols-3">
          {pillars.map((item, i) => (
            <li
              key={item.title}
              className={`border-b border-vb-line py-10 md:border-b-0 ${
                i < pillars.length - 1 ? "md:border-r md:pr-10" : ""
              } ${i > 0 ? "md:pl-10" : ""}`}
              data-vb-reveal="up"
              data-vb-reveal-delay={i * 80}
            >
              <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-vb-accent">
                0{i + 1}
              </span>
              <h3 className="mt-4 font-heading text-xl font-bold uppercase tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-vb-muted sm:text-[15px]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
