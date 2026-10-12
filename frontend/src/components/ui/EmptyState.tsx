import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  hint: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-line bg-band text-muted">
        <Icon name={icon} className="size-7" strokeWidth={1.5} />
      </div>
      <p className="text-base font-bold text-heading">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
