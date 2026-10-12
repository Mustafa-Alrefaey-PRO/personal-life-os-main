import { useTranslation } from 'react-i18next';
import { useRamadanStore } from '../../stores/ramadanStore';

const STARS = [
  { cx: 8, cy: 12, r: 1.1, delay: 0 }, { cx: 22, cy: 5, r: 0.7, delay: 0.7 }, { cx: 38, cy: 18, r: 1.3, delay: 1.4 },
  { cx: 52, cy: 7, r: 0.9, delay: 0.3 }, { cx: 67, cy: 22, r: 0.6, delay: 1.0 }, { cx: 79, cy: 9, r: 1.0, delay: 0.5 },
  { cx: 91, cy: 16, r: 0.8, delay: 1.8 }, { cx: 14, cy: 34, r: 0.7, delay: 1.2 }, { cx: 31, cy: 42, r: 1.2, delay: 0.2 },
  { cx: 47, cy: 30, r: 0.5, delay: 0.9 }, { cx: 63, cy: 38, r: 0.9, delay: 1.6 }, { cx: 84, cy: 32, r: 0.7, delay: 0.4 },
];

/** Decorative greeting shown while the Ramadan theme is on. Its fixed night-sky colors are intentional. */
export function RamadanBanner() {
  const { t } = useTranslation();
  const enabled = useRamadanStore((s) => s.enabled);
  if (!enabled) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-lg border border-amber-400/25 bg-[linear-gradient(135deg,#0c0623_0%,#1a0d52_40%,#2a1260_70%,#0c0623_100%)] shadow-card">
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 50">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} className="ramadan-star fill-amber-400" style={{ animationDelay: `${s.delay}s` }} />
        ))}
      </svg>
      <div className="relative flex items-center gap-4 px-5 py-4">
        <svg width="44" height="44" viewBox="0 0 60 60" className="hidden shrink-0 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] sm:block" aria-hidden="true">
          <path d="M34 8C22 8 13 17 13 29C13 41 22 50 34 50C26 50 19.5 43 19.5 35.5C19.5 28 25 20 34 8Z" />
        </svg>
        <div>
          <p className="text-lg font-bold text-amber-400">{t('ramadan.greeting')}</p>
          <p className="text-sm text-amber-100/80">{t('ramadan.subtext')}</p>
        </div>
      </div>
    </div>
  );
}
