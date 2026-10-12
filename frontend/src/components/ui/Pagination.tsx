import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

const stepButton = 'inline-flex h-8 items-center gap-1.5 rounded border border-line-strong px-3 text-[13px] font-semibold text-muted transition-colors duration-150 hover:bg-hover hover:text-title disabled:opacity-40 disabled:hover:bg-transparent';

/** Centered pager: outlined Previous/Next and the current page as a dark-blue circle. */
export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <nav aria-label={t('pagination.range', { from, to, total: totalItems })} className="flex items-center justify-center gap-2 pt-4">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} className={stepButton}>
        <Icon name="chevronLeft" className="size-4 rtl:rotate-180" />
        {t('pagination.previous')}
      </button>
      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`e${idx}`} className="px-1 text-muted">…</span>
        ) : (
          <button key={p} type="button" onClick={() => onPageChange(p)} aria-current={p === page ? 'page' : undefined}
            className={`inline-flex size-8 items-center justify-center rounded-full text-[13px] font-semibold transition-colors duration-150 ${
              p === page ? 'bg-primary-dark text-on-primary' : 'text-muted hover:bg-hover hover:text-title'
            }`}>
            {p}
          </button>
        ),
      )}
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className={stepButton}>
        {t('pagination.next')}
        <Icon name="chevronRight" className="size-4 rtl:rotate-180" />
      </button>
    </nav>
  );
}
