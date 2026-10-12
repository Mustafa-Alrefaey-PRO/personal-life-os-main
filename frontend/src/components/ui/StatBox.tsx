import { Icon, type IconName } from './Icon';

interface StatBoxProps {
  label: string;
  value: React.ReactNode;
  icon: IconName;
  /** Turns the value red when it needs attention (e.g. overdue items, negative balance) */
  alert?: boolean;
}

/** Neutral KPI card: label, large value and a small brand-tinted icon. Color is reserved for alerts. */
export function StatBox({ label, value, icon, alert = false }: StatBoxProps) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
        <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-md ${alert ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-title'}`}>
          <Icon name={icon} className="size-5" strokeWidth={1.75} />
        </span>
      </div>
      <p className={`mt-1 truncate text-2xl font-bold ${alert ? 'text-danger' : 'text-title'}`}>{value}</p>
    </div>
  );
}
