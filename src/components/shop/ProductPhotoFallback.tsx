/** Quiet stand-in when a product has no photograph yet. */
export default function ProductPhotoFallback({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-vb-mist px-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-mark.png"
        alt=""
        width={compact ? 36 : 72}
        height={compact ? 36 : 72}
        className={compact ? "h-9 w-9 opacity-80" : "h-16 w-16 opacity-90 sm:h-[4.5rem] sm:w-[4.5rem]"}
      />
      {!compact && (
        <p className="mt-4 max-w-[14rem] font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-ink/70">
          {name}
        </p>
      )}
    </div>
  );
}
