import { Icon, type IconName } from './Icon';

const tones = {
  default: 'text-title hover:bg-hover',
  danger: 'text-title hover:bg-danger-soft hover:text-danger',
  /** Row "open details" eye: larger, no box, brightens on hover */
  strong: 'text-title hover:text-primary',
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  tone?: keyof typeof tones;
}

/** Plain icon button for row actions (no box); label is the tooltip and screen-reader name. */
export function IconButton({ icon, label, tone = 'default', className = '', ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex size-9 items-center justify-center rounded-md transition-colors duration-150 disabled:opacity-50 ${tones[tone]} ${className}`}
      {...rest}
    >
      <Icon name={icon} className={tone === 'strong' ? 'size-6' : 'size-5'} strokeWidth={1.75} />
    </button>
  );
}
