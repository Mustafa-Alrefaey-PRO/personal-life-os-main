import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Icon } from './Icon';

interface FilterToggleProps {
  open: boolean;
  onToggle: () => void;
  activeCount: number;
}

/**
 * Toolbar tab attached to the content edge. The round arrow overlaps its inner edge.
 * When the panel opens, the tab widens to the panel's width so the two read as one block.
 */
export function FilterToggle({ open, onToggle, activeCount }: FilterToggleProps) {
  const { t, i18n } = useTranslation();
  // Same rule as the sidebar toggle: closed points toward the content ("open"),
  // open points toward the page edge ("collapse"); mirrored in RTL.
  const flipArrow = open !== (i18n.language === 'ar');
  return (
    <div className="relative ms-3 -me-4 sm:-me-6 lg:-me-8">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={t('filters.searchFilter')}
        className="absolute -start-[18px] top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-band text-title transition-colors duration-150 hover:bg-hover"
      >
        <Icon name="chevronLeft" strokeWidth={1.75} className={`size-5 transition-transform duration-300 ${flipArrow ? 'rotate-180' : ''}`} />
      </button>
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        // Width animates between two fixed values so the tab opens in one smooth motion
        className={`flex h-10 max-w-[calc(100vw-2rem)] animate-tab-open items-center justify-between gap-4 overflow-hidden rounded-s-xl border border-e-0 border-line bg-surface ps-6 pe-4 text-sm whitespace-nowrap text-title transition-[width,background-color] duration-[1200ms] ease-slide hover:bg-hover sm:pe-6 lg:pe-8 ${
          open ? 'w-[22rem]' : 'w-[12.5rem]'
        }`}
      >
        <span className={`rounded-md px-2 py-0.5 font-medium ${activeCount > 0 ? 'bg-primary text-on-primary' : 'bg-band'}`}>
          {t('filters.title')} ({activeCount})
        </span>
        <span className="flex items-center gap-3 text-base">
          {/* The "Search / Filter" label slides in only while the panel is open */}
          <span className={`grid transition-[grid-template-columns,opacity] duration-[1200ms] ease-slide ${open ? 'grid-cols-[1fr] opacity-100' : 'grid-cols-[0fr] opacity-0'}`}>
            <span className="overflow-hidden">{t('filters.searchFilter')}</span>
          </span>
          <Icon name="sliders" className="size-6 shrink-0" strokeWidth={1.5} />
        </span>
      </button>
    </div>
  );
}

interface FilterPanelProps {
  open: boolean;
  onApply: () => void;
  onClear: () => void;
  children: React.ReactNode;
}

/**
 * Side panel next to the list. Opening: the space is reserved at once (the table narrows immediately)
 * and the panel fades in while sliding from the page edge over 1.2s. Closing: the panel is removed at once.
 */
export function FilterPanel({ open, onApply, onClear, children }: FilterPanelProps) {
  const { t } = useTranslation();
  return (
    <div
      // inert: hidden fields can't be tabbed into while closed
      inert={!open}
      className={`shrink-0 self-stretch overflow-hidden max-lg:w-full ${open ? 'lg:ms-4 lg:-me-8 lg:w-[22rem]' : 'max-lg:hidden lg:w-0'}`}
    >
      <form
        onSubmit={(e) => { e.preventDefault(); onApply(); }}
        className={`filter-panel flex w-full flex-col rounded-lg bg-band transition-[translate,opacity] duration-[1200ms] ease-slide lg:w-[22rem] lg:rounded-e-none ${
          // Like the reference: starts half-way out at the page edge and transparent, then fades in as it slides into place
          open ? 'translate-x-0 opacity-100' : 'translate-x-1/2 opacity-0 rtl:-translate-x-1/2'
        }`}
        aria-label={t('filters.title')}
      >
        {/* Standard height on every page; extra fields scroll (styled scrollbar), actions stay pinned */}
        <div className="brand-scroll space-y-4 overflow-y-auto p-4 lg:h-[24rem]">{children}</div>
        <div className="space-y-3 border-t border-line p-4">
          <Button type="submit" icon="sliders" className="w-full">{t('filters.searchFilter')}</Button>
          <Button variant="white" icon="xCircle" onClick={onClear} className="w-full">{t('filters.clear')}</Button>
        </div>
      </form>
    </div>
  );
}
