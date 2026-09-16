import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-vb-mist", className)}
      aria-hidden
    />
  );
}

/** Full admin page placeholder (route `loading.tsx` + client fetch). */
export function AdminPageSkeleton({
  rows = 6,
  withAction = false,
}: {
  rows?: number;
  withAction?: boolean;
}) {
  return (
    <div role="status" aria-label="Loading" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Bone className="h-8 w-48 sm:w-64" />
          <Bone className="h-4 w-72 max-w-full sm:w-96" />
        </div>
        {withAction && <Bone className="h-10 w-36" />}
      </div>
      <AdminTableSkeleton rows={rows} />
    </div>
  );
}

export function AdminTableSkeleton({
  rows = 6,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Loading table"
      className="overflow-hidden border border-vb-line bg-vb-white"
    >
      <div className="flex gap-4 border-b border-vb-line bg-vb-mist px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Bone key={i} className="h-3 flex-1" />
        ))}
      </div>
      <ul>
        {Array.from({ length: rows }).map((_, row) => (
          <li
            key={row}
            className="flex items-center gap-4 border-b border-vb-line px-4 py-4 last:border-0"
          >
            {Array.from({ length: cols }).map((_, col) => (
              <Bone
                key={col}
                className={cn(
                  "h-3.5 flex-1",
                  col === 0 && "max-w-[40%]",
                  col === cols - 1 && "max-w-[4.5rem]"
                )}
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-vb-line bg-vb-white p-5">
          <Bone className="h-3 w-20" />
          <Bone className="mt-4 h-8 w-16" />
          <Bone className="mt-3 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function AdminDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-8">
      <div className="space-y-3">
        <Bone className="h-8 w-56" />
        <Bone className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 border border-vb-line bg-vb-white p-6">
          <Bone className="h-4 w-32" />
          <Bone className="h-10 w-full" />
          <Bone className="h-10 w-full" />
          <Bone className="h-24 w-full" />
        </div>
        <div className="space-y-4 border border-vb-line bg-vb-white p-6">
          <Bone className="h-4 w-28" />
          <Bone className="h-10 w-full" />
          <Bone className="h-10 w-full" />
          <Bone className="h-10 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function AdminFormSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="max-w-2xl space-y-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-11 w-full" />
        </div>
      ))}
      <Bone className="mt-4 h-11 w-40" />
    </div>
  );
}
