import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

interface PreviewTipProps {
  /** Label/value pairs shown in the card; empty values are skipped */
  items: [label: string, value: React.ReactNode][];
}

/**
 * Row "i" icon: hovering or focusing it shows a small card with the record's key fields,
 * so the user can peek without opening the details page.
 * The card renders in <body> with fixed positioning so the table never clips it.
 */
export function PreviewTip({ items }: PreviewTipProps) {
  const { t } = useTranslation();
  const id = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    // Open below the icon unless that would run off the bottom of the window
    const above = r.bottom + 160 > window.innerHeight;
    // Centered on the icon, but kept inside the window (the card is 14rem = 224px wide)
    const half = 112 + 8;
    const left = Math.min(Math.max(r.left + r.width / 2, half), window.innerWidth - half);
    setPos({ top: above ? r.top - 6 : r.bottom + 6, left, above });
  };
  const hide = () => setPos(null);

  const rows = items.filter(([, value]) => value !== undefined && value !== null && value !== '');

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label={t('common.preview')}
        aria-describedby={pos ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex size-9 items-center justify-center rounded-md text-title transition-colors duration-150 hover:text-primary"
      >
        <Icon name="preview" className="size-5" />
      </button>
      {pos && createPortal(
        <div
          id={id}
          role="tooltip"
          style={{ top: pos.top, left: pos.left }}
          className={`pointer-events-none fixed z-[70] w-56 -translate-x-1/2 animate-modal-in rounded-md border border-line bg-surface px-3 py-2 shadow-pop ${pos.above ? '-translate-y-full' : ''}`}
        >
          <dl className="space-y-1 text-xs">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className="shrink-0 text-muted">{label}</dt>
                <dd className="truncate text-end font-semibold text-title">{value}</dd>
              </div>
            ))}
          </dl>
        </div>,
        document.body,
      )}
    </>
  );
}
