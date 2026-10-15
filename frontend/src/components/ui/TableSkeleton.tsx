/** Grey shimmering rows shown while a list loads for the first time, in place of the table. */
export function TableSkeleton({ rows = 5, label }: { rows?: number; label: string }) {
  return (
    <div role="status" aria-label={label} className="divide-y divide-line">
      <div className="h-13 bg-table-head" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid h-13 grid-cols-[2fr_1fr_1fr_0.6fr] items-center gap-6 px-6">
          {[0, 1, 2, 3].map((cell) => (
            <span key={cell} className="h-3 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
          ))}
        </div>
      ))}
    </div>
  );
}
