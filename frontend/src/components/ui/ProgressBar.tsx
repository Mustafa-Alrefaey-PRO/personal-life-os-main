/** Labelled upload progress bar. */
export function ProgressBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-body">{label}</span>
        <span className="font-semibold text-primary">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border border-line bg-band">
        <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
