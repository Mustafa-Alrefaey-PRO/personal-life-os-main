import { Icon, type IconName } from './Icon';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'soft' | 'white' | 'danger' | 'dangerOutline' | 'success';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary border-primary shadow-card hover:bg-primary/90',
  secondary: 'bg-surface text-title border-input-line hover:bg-hover',
  /** Light gray toolbar button with a soft shadow */
  soft: 'bg-band text-title border-transparent shadow-card hover:bg-hover',
  /** White with a soft shadow, for secondary actions on gray panels */
  white: 'bg-surface text-title border-line shadow-card hover:bg-hover',
  danger: 'bg-danger text-on-primary border-danger shadow-card hover:bg-danger/90',
  /** Red outline, for a destructive action that isn't the main one (e.g. Delete on a details page) */
  dangerOutline: 'bg-surface text-danger border-danger-line hover:bg-danger-soft',
  success: 'bg-success text-on-primary border-success shadow-card hover:bg-success/90',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
}

/** One size everywhere: 40px tall, 14px label, 20px icon. The status dropdown and the filter tab match it. */
export function Button({
  variant = 'primary', icon, loading = false, className = '', children, disabled, type = 'button', ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border font-normal whitespace-nowrap transition-colors duration-150 disabled:opacity-60 h-10 gap-1.5 px-4 text-sm ${variants[variant]} ${className}`}
      {...rest}
    >
      {/* The spinner replaces the icon in the same slot, so the button never changes width */}
      {loading
        ? <span className="inline-flex size-5 items-center justify-center"><Spinner size="sm" className="border-current/30 border-t-current" /></span>
        : icon && <Icon name={icon} className="size-5" strokeWidth={1.5} />}
      {children}
    </button>
  );
}
