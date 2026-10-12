import { Icon, type IconName } from './Icon';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'soft' | 'white' | 'danger' | 'dangerOutline' | 'success';
type Size = 'sm' | 'md';

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

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-13 px-5 text-base gap-2.5',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', icon, loading = false, className = '', children, disabled, type = 'button', ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border font-normal whitespace-nowrap transition-colors duration-150 disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {/* The spinner replaces the icon in the same slot, so the button never changes width */}
      {loading
        ? <span className={`inline-flex items-center justify-center ${size === 'md' ? 'size-6' : 'size-5'}`}><Spinner size="sm" className="border-current/30 border-t-current" /></span>
        : icon && <Icon name={icon} className={size === 'md' ? 'size-6' : 'size-5'} strokeWidth={1.5} />}
      {children}
    </button>
  );
}
