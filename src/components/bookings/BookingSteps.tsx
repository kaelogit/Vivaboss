import { cn } from "@/lib/utils";

export default function BookingSteps({
  steps,
  current,
}: {
  steps: readonly string[];
  current: number;
}) {
  return (
    <ol className="grid grid-cols-3 gap-3" aria-label="Booking progress">
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={label} aria-current={active ? "step" : undefined}>
            <p
              className={cn(
                "font-heading text-[10px] font-semibold uppercase tracking-[0.16em]",
                active ? "text-vb-accent" : done ? "text-vb-ink" : "text-vb-muted"
              )}
            >
              {i + 1}. {label}
            </p>
            <div
              className={cn(
                "mt-2 h-0.5",
                active || done ? "bg-vb-accent" : "bg-vb-line"
              )}
            />
          </li>
        );
      })}
    </ol>
  );
}
