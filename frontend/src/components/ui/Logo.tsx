import { useTranslation } from 'react-i18next';

interface LogoProps {
  /** Show the app name next to the mark */
  withName?: boolean;
  size?: 'md' | 'lg';
  /** Text color class for the name (e.g. on dark panels) */
  nameClassName?: string;
}

/**
 * Personal Life OS mark: a classic seal — a flat square with a double frame and a serif "PL" monogram.
 * The tile follows the active brand palette; the small rule under the monogram uses the accent.
 */
export function Logo({ withName = true, size = 'md', nameClassName = 'text-title' }: LogoProps) {
  const { t } = useTranslation();
  return (
    <span className="flex min-w-0 items-center gap-3">
      <svg viewBox="0 0 32 32" className={`shrink-0 ${size === 'lg' ? 'size-11' : 'size-9'}`} aria-hidden="true">
        <rect width="32" height="32" rx="3" className="fill-primary-dark" />
        <rect x="2.5" y="2.5" width="27" height="27" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" className="text-on-primary/70" />
        <rect x="4.5" y="4.5" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-on-primary/40" />
        <text x="16" y="20.5" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="13" fontWeight="700" letterSpacing="-0.5" className="fill-on-primary">PL</text>
        <rect x="11" y="23" width="10" height="1.2" className="fill-accent" />
      </svg>
      {withName && (
        <span className={`line-clamp-2 font-serif text-[13px] rtl:font-sans rtl:text-[15px] leading-tight font-bold tracking-normal uppercase ${nameClassName}`}>
          {t('auth.appName')}
        </span>
      )}
    </span>
  );
}
