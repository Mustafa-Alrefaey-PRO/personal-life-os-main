import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeStore, type ThemePreference } from '../../stores/themeStore';
import { Icon, type IconName } from './Icon';

const OPTIONS: { value: ThemePreference; icon: IconName; label: string }[] = [
  { value: 'light', icon: 'sun', label: 'theme.light' },
  { value: 'dark', icon: 'moon', label: 'theme.dark' },
  { value: 'system', icon: 'monitor', label: 'theme.system' },
];

// The thumb's start offset per choice: 3px padding + n × 32px option
const THUMB_POSITION = ['start-[3px]', 'start-[35px]', 'start-[67px]'];

/**
 * Three-way theme switch — Light, Dark, System — like an Apple toggle: a pill with a solid
 * circle that slides under the current choice. A radio group: Tab focuses the current
 * choice, arrow keys move between them (mirrored in Arabic).
 */
export const ThemeSwitch = () => {
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useThemeStore();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const index = OPTIONS.findIndex((option) => option.value === preference);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const rtl = i18n.dir() === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const step = event.key === forward || event.key === 'ArrowDown' ? 1 : event.key === back || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + OPTIONS.length) % OPTIONS.length;
    setPreference(OPTIONS[next].value);
    buttons.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={t('theme.label')} className="relative inline-flex shrink-0 rounded-full border border-line bg-band p-[3px]">
      <span
        aria-hidden="true"
        className={`absolute inset-y-[3px] w-8 rounded-full bg-primary shadow-card transition-[inset-inline-start] duration-200 ease-[cubic-bezier(0.3,0.9,0.3,1.1)] motion-reduce:transition-none ${THUMB_POSITION[index]}`}
      />
      {OPTIONS.map((option, i) => (
        <button
          key={option.value}
          ref={(element) => { buttons.current[i] = element; }}
          type="button"
          role="radio"
          aria-checked={i === index}
          aria-label={t(option.label)}
          title={option.value === 'system' ? t('theme.systemHint') : t(option.label)}
          tabIndex={i === index ? 0 : -1}
          onClick={() => setPreference(option.value)}
          onKeyDown={onKeyDown}
          className={`relative inline-flex size-8 items-center justify-center rounded-full transition-colors duration-150 ${
            i === index ? 'text-on-primary' : 'text-muted hover:text-title'
          }`}
        >
          <Icon name={option.icon} className="size-4" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
};
