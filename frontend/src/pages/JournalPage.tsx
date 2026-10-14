import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDateLong, isInDateRange } from '../utils/formatDate';
import { journalService } from '../services/journal.service';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { Pagination } from '../components/ui/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useWithoutPending } from '../stores/pendingDeleteStore';
import { useFilters } from '../hooks/useFilters';
import { FilterPanel, FilterToggle } from '../components/ui/FilterPanel';

export default function JournalPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = useFilters({ search: '', from: '', to: '' });
  const f = filters.applied;

  const { data, isLoading } = useQuery({ queryKey: ['journal'], queryFn: () => journalService.getAllJournals() });

  // Rows with a pending delete (Undo toast showing) stay hidden
  const entries = useWithoutPending('journal', data?.data ?? []);
  const query = f.search.toLowerCase();
  const filtered = entries
    .filter((e) => !query || e.notes.toLowerCase().includes(query))
    .filter((e) => isInDateRange(e.date, f.from, f.to))
    .sort((a, b) => b.date.localeCompare(a.date));
  const { paged, paginationProps } = usePagination(filtered);
  const hasFilters = filters.activeCount > 0;

  return (
    <MainLayout>
      <PageHeader
        icon="journal"
        title={t('journal.title')}
        subtitle={t('journal.entries_count', { count: filtered.length })}
        actions={<><Button icon="journal" onClick={() => navigate('/journal/new')}>{t('journal.newEntry')}</Button><FilterToggle open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)} activeCount={filters.activeCount} /></>}
      />

      <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-0">
        <div className="w-full min-w-0 flex-1">
          {isLoading ? <PageLoader message={t('journal.loading')} /> : filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon="journal"
                title={hasFilters ? t('journal.noResults') : t('journal.noEntries')}
                hint={hasFilters ? t('journal.noResultsHint') : t('journal.noEntriesHint')}
                action={!hasFilters && <Button icon="journal" onClick={() => navigate('/journal/new')}>{t('journal.newEntry')}</Button>}
              />
            </Card>
          ) : (
            <>
            <Card padded={false}>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {paged.map((entry) => (
                  <article key={entry.id} className="flex flex-col overflow-hidden rounded-md border border-line bg-surface">
                    <header className="flex items-center justify-between gap-3 border-b border-line bg-band px-4 py-2.5">
                      <p className="flex items-center gap-2 text-sm font-bold text-heading">
                        <Icon name="calendar" className="size-4 text-primary" />
                        {formatDateLong(entry.date, i18n.language)}
                      </p>
                      <div className="flex shrink-0 gap-1.5">
                        <IconButton icon="view" tone="strong" label={t('common.view')} onClick={() => navigate(`/journal/${entry.id}`)} />
                      </div>
                    </header>
                    <p className="line-clamp-6 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-body">{entry.notes}</p>
                  </article>
                ))}
              </div>
            </Card>
            <Pagination {...paginationProps} />
            </>
          )}
        </div>
        <FilterPanel open={filterOpen} onApply={filters.apply} onClear={filters.clear}>
          <FormField label={t('filters.keyword')}>
            {(id) => <input id={id} type="search" value={filters.draft.search} onChange={(e) => filters.setDraft({ search: e.target.value })} placeholder={t('journal.search')} />}
          </FormField>
          <FormField label={t('common.dateFrom')}>
            {(id) => <AppDatePicker id={id} value={filters.draft.from} onChange={(v) => filters.setDraft({ from: v })} />}
          </FormField>
          <FormField label={t('common.dateTo')}>
            {(id) => <AppDatePicker id={id} value={filters.draft.to} onChange={(v) => filters.setDraft({ to: v })} />}
          </FormField>
        </FilterPanel>
      </div>

    </MainLayout>
  );
}
