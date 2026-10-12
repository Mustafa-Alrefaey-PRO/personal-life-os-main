import { useTranslation } from 'react-i18next';
import { BRANDS, useBrandStore, type Brand } from '../../stores/brandStore';
import { Icon } from './Icon';

// Preview chips only; the real palettes live in index.css ([data-brand="…"])
const SWATCH: Record<Brand, string> = {
  ocean: 'bg-[#1d75af]',
  navy: 'bg-[#1f3a68]',
  teal: 'bg-[#0e7c86]',
  graphite: 'bg-[#3d4b5c]',
  burgundy: 'bg-[#8a1c3c]',
};

/** Lets the user choose the brand color of the whole app. */
export function BrandPicker() {
  const { t } = useTranslation();
  const { brand, setBrand } = useBrandStore();
  return (
    <div role="radiogroup" aria-label={t('profile.brandColor')} className="flex flex-wrap gap-3">
      {BRANDS.map((b) => {
        const active = b === brand;
        return (
          <button
            key={b}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setBrand(b)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors duration-150 ${
              active ? 'border-primary bg-primary-soft text-title' : 'border-line text-body hover:bg-hover'
            }`}
          >
            <span className={`flex size-5 items-center justify-center rounded-full text-white ${SWATCH[b]}`}>
              {active && <Icon name="check" className="size-3" strokeWidth={3} />}
            </span>
            {t(`profile.brands.${b}`)}
          </button>
        );
      })}
    </div>
  );
}
