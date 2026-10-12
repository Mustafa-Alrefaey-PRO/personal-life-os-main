import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate, isInDateRange } from '../utils/formatDate';
import { formatMoney } from '../utils/formatMoney';
import { categoryLabel } from '../utils/categoryLabel';
import { transactionService } from '../services/transaction.service';
import type { TransactionType } from '../types/transaction';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Badge } from '../components/ui/Badge';
import { DataTable, Th, Tr, Td, EmptyRow } from '../components/ui/DataTable';
import { FormField } from '../components/ui/FormField';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { AppSelect } from '../components/ui/AppSelect';
import { PreviewTip } from '../components/ui/PreviewTip';
import { Pagination } from '../components/ui/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';
import { FilterPanel, FilterToggle } from '../components/ui/FilterPanel';

export default function TransactionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = useFilters({ search: '', type: 'All', from: '', to: '' });
  const f = filters.applied;

  const { data, isLoading } = useQuery({ queryKey: ['transactions'], queryFn: () => transactionService.getAllTransactions() });

  const all = data?.data ?? [];

  const query = f.search.toLowerCase();
  const filtered = all
    .filter((tx) => f.type === 'All' || tx.type === f.type)
    .filter((tx) => !query || tx.category?.toLowerCase().includes(query) || tx.notes?.toLowerCase().includes(query))
    .filter((tx) => isInDateRange(tx.date, f.from, f.to))
    .sort((a, b) => b.date.localeCompare(a.date));
  const { paged, paginationProps } = usePagination(filtered);
  const hasFilters = filters.activeCount > 0;
  const typeLabel = (type: TransactionType) => (type === 'Income' ? t('transactions.income') : t('transactions.expense'));

  return (
    <MainLayout>
      <PageHeader
        icon="transactions"
        title={t('transactions.title')}
        subtitle={`${all.length} ${t('transactions.entries')}`}
        actions={<><Button icon="plus" onClick={() => navigate('/transactions/new')}>{t('transactions.addTransaction')}</Button><FilterToggle open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)} activeCount={filters.activeCount} /></>}
      />

      <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-0">
        <div className="w-full min-w-0 flex-1">
          <Card padded={false}>
            {isLoading ? <PageLoader message={t('transactions.loading')} /> : (
              <>
                <DataTable>
                  <thead>
                    <tr>
                      <Th>{t('transactions.type')}</Th>
                      <Th>{t('transactions.category')}</Th>
                      <Th className="hidden sm:table-cell">{t('transactions.date')}</Th>
                      <Th className="hidden md:table-cell">{t('transactions.notes')}</Th>
                      <Th className="text-end">{t('transactions.amount')}</Th>
                      <Th className="w-24">{t('common.details')}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && <EmptyRow colSpan={6} title={hasFilters ? t('transactions.noResults') : t('transactions.noTransactions')} hint={hasFilters ? t('transactions.noResultsHint') : t('transactions.noTransactionsHint')} action={!hasFilters && <Button icon="plus" onClick={() => navigate('/transactions/new')}>{t('transactions.addTransaction')}</Button>} />}
                    {paged.map((tx) => {
                      const income = tx.type === 'Income';
                      return (
                        <Tr key={tx.id}>
                          <Td><Badge tone={income ? 'success' : 'danger'}>{typeLabel(tx.type)}</Badge></Td>
                          <Td>{tx.category ? categoryLabel(tx.category, t) : typeLabel(tx.type)}</Td>
                          <Td className="hidden text-muted sm:table-cell">{formatDate(tx.date)}</Td>
                          <Td className="hidden max-w-xs truncate text-muted md:table-cell">{tx.notes || '—'}</Td>
                          <Td className={`text-end font-bold whitespace-nowrap ${income ? 'text-success' : 'text-danger'}`}>
                            {income ? '+' : '−'}{formatMoney(tx.amount)}
                          </Td>
                          <Td>
                            <div className="flex items-center justify-center">
                              <PreviewTip items={[
                                [t('transactions.type'), typeLabel(tx.type)],
                                [t('transactions.amount'), formatMoney(tx.amount)],
                                [t('transactions.date'), formatDate(tx.date)],
                                [t('transactions.notes'), tx.notes],
                              ]} />
                              <IconButton icon="view" tone="strong" label={t('common.view')} onClick={() => navigate(`/transactions/${tx.id}`)} />
                            </div>
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </DataTable>
              </>
            )}
          </Card>
          <Pagination {...paginationProps} />
        </div>
        <FilterPanel open={filterOpen} onApply={filters.apply} onClear={filters.clear}>
          <FormField label={t('filters.keyword')}>
            {(id) => <input id={id} type="search" value={filters.draft.search} onChange={(e) => filters.setDraft({ search: e.target.value })} placeholder={t('transactions.search')} />}
          </FormField>
          <FormField label={t('transactions.type')}>
            {(id) => <AppSelect id={id} value={filters.draft.type} onChange={(v) => filters.setDraft({ type: v })} options={[
              { value: 'All', label: t('transactions.all') },
              { value: 'Income', label: t('transactions.income') },
              { value: 'Expense', label: t('transactions.expense') },
            ]} />}
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
