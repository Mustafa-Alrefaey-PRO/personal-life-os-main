export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const tones: Record<BadgeTone, { pill: string; dot: string }> = {
  success: { pill: 'bg-success-soft text-success', dot: 'bg-success' },
  warning: { pill: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  danger: { pill: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  info: { pill: 'bg-info-soft text-info', dot: 'bg-info' },
  neutral: { pill: 'bg-band text-body', dot: 'bg-muted' },
};

/** Soft tinted status pill with a colored dot. */
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  const { pill, dot } = tones[tone];
  return (
    <span className={`inline-flex h-[26px] items-center gap-1.5 rounded px-2 text-sm font-semibold whitespace-nowrap ${pill}`}>
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {children}
    </span>
  );
}
