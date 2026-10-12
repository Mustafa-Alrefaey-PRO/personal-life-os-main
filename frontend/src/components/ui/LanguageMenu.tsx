import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
] as const;

/**
 * Shows the current language with a dropdown arrow; the menu lists the languages
 * so the user can switch to the other one.
 */
export function LanguageMenu() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('profile.language')}
        className="inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm text-title transition-colors duration-150 hover:bg-hover"
      >
        <Icon name="globe" className="size-5" strokeWidth={1.5} />
        <span className="hidden sm:inline">{current.label}</span>
        <Icon name="chevronDown" className={`size-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul role="menu" className="absolute end-0 z-50 mt-1 min-w-40 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-pop">
          {LANGUAGES.map((lang) => {
            const active = lang.code === current.code;
            return (
              <li key={lang.code} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm transition-colors duration-150 hover:bg-hover ${
                    active ? 'font-semibold text-title' : 'text-body'
                  }`}
                >
                  {lang.label}
                  {active && <Icon name="check" className="size-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
