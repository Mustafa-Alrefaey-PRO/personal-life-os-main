import { Icon, type IconName } from './Icon';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const styles: Record<AlertVariant, { box: string; icon: IconName }> = {
  success: { box: 'border-success-line border-s-success bg-success-soft text-success', icon: 'check' },
  error: { box: 'border-danger-line border-s-danger bg-danger-soft text-danger', icon: 'alert' },
  warning: { box: 'border-warning-line border-s-warning bg-warning-soft text-warning', icon: 'alert' },
  info: { box: 'border-info-line border-s-info bg-info-soft text-info', icon: 'info' },
};

interface AlertProps {
  variant: AlertVariant;
  message: string;
  /** Shows a close button when provided. */
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
}

/**
 * Tinted banner with a solid bar on the leading edge and a status icon.
 * Used inline (form errors) and as the body of toasts.
 */
export function Alert({ variant, message, onClose, closeLabel, className = '' }: AlertProps) {
  const { box, icon } = styles[variant];
  return (
    // Opaque surface underneath so semi-transparent dark tints stay solid when floating
    <div role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'} className={`rounded-md bg-surface shadow-card ${className}`}>
      <div className={`flex items-center gap-3 rounded-md border border-s-4 py-3 ps-4 pe-3 ${box}`}>
        <Icon name={icon} className="size-5 shrink-0" />
        <p className="flex-1 text-sm font-semibold">{message}</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded opacity-70 hover:opacity-100"
          >
            <Icon name="x" className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
