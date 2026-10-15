import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate, isInDateRange, toDateKey, todayKey } from '../utils/formatDate';
import { formatMoney } from '../utils/formatMoney';
import { billService } from '../services/bill.service';
import type { Bill } from '../types/bill';
import { Status } from '../types/status';
import { MainLayout } from '../components/layout/MainLayout';
import { Spinner } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Badge } from '../components/ui/Badge';
import { Icon } from '../components/ui/Icon';
import { DataTable, Th, Tr, Td, EmptyRow } from '../components/ui/DataTable';
import { FormField } from '../components/ui/FormField';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { AppSelect } from '../components/ui/AppSelect';
import { PreviewTip } from '../components/ui/PreviewTip';
import { useToast } from '../components/ui/useToast';
import { Pagination } from '../components/ui/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useWithoutPending } from '../stores/pendingDeleteStore';
import { useFilters } from '../hooks/useFilters';
import { FilterPanel, FilterToggle } from '../components/ui/FilterPanel';

export default function BillsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [payingId, setPayingId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = useFilters({ search: '', status: 'All', from: '', to: '' });
  const f = filters.applied;

  const { data, isLoading } = useQuery({ queryKey: ['bills'], queryFn: () => billService.getAllBills() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const togglePaidMutation = useMutation({
    mutationFn: (bill: Bill) => bill.statusCode === Status.Paid ? billService.markAsUnpaid(bill.id) : billService.markAsPaid(bill.id),
    onMutate: (bill) => setPayingId(bill.id),
    onSuccess: (_, bill) => { invalidate(); showToast(bill.statusCode === Status.Paid ? t('bills.unpaid') : t('bills.paid'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
    onSettled: () => setPayingId(null),
  });

  const today = todayKey();
  // Rows with a pending delete (Undo toast showing) stay hidden
  const bills = useWithoutPending('bills', data?.data ?? []);
  const isOverdue = (bill: Bill) => bill.statusCode === Status.Pending && toDateKey(bill.dueDate) < today;
  const pending = bills.filter((b) => b.statusCode === Status.Pending);
  const paidCount = bills.filter((b) => b.statusCode === Status.Paid).length;

  const query = f.search.toLowerCase();
  const filtered = bills
    .filter((b) => f.status === 'All' || b.statusCode === f.status)
    .filter((b) => !query || b.name.toLowerCase().includes(query))
    .filter((b) => isInDateRange(b.dueDate, f.from, f.to));
  const { paged, paginationProps } = usePagination(filtered);
  const hasFilters = filters.activeCount > 0;

  return (
    <MainLayout>
      <PageHeader
        icon="bills"
        title={t('bills.title')}
        subtitle={`${t('bills.pending_count', { count: pending.length })} · ${t('bills.paid_count', { count: paidCount })}`}
        actions={<><Button icon="bills" onClick={() => navigate('/bills/new')}>{t('bills.addBill')}</Button><FilterToggle open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)} activeCount={filters.activeCount} /></>}
      />

      <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-0">
        <div className="w-full min-w-0 flex-1">
          <Card padded={false}>
            {isLoading ? <TableSkeleton label={t('bills.loading')} /> : (
              <>
                <DataTable>
                  <thead>
                    <tr>
                      <Th className="w-12" />
                      <Th>{t('bills.name')}</Th>
                      <Th className="hidden sm:table-cell">{t('common.status')}</Th>
                      <Th className="hidden sm:table-cell">{t('bills.dueDate')}</Th>
                      <Th className="text-end">{t('bills.amount')}</Th>
                      <Th className="w-24">{t('common.details')}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && <EmptyRow colSpan={6} title={hasFilters ? t('bills.noResults') : t('bills.noBills')} hint={hasFilters ? t('bills.noResultsHint') : t('bills.noBillsHint')} action={!hasFilters && <Button icon="bills" onClick={() => navigate('/bills/new')}>{t('bills.addBill')}</Button>} />}
                    {paged.map((bill) => {
                      const paid = bill.statusCode === Status.Paid;
                      const overdue = isOverdue(bill);
                      return (
                        <Tr key={bill.id}>
                          <Td>
                            <button
                              type="button"
                              onClick={() => togglePaidMutation.mutate(bill)}
                              disabled={payingId === bill.id}
                              title={paid ? t('bills.markUnpaid') : t('bills.pay')}
                              aria-label={paid ? t('bills.markUnpaid') : t('bills.pay')}
                              className={`flex size-5 items-center justify-center rounded border-2 transition-colors ${
                                paid ? 'border-success bg-success text-on-primary' : 'border-line-strong text-transparent hover:border-success'
                              }`}
                            >
                              {payingId === bill.id ? <Spinner size="sm" className="border-current/30 border-t-current" /> : <Icon name="check" className="size-3" strokeWidth={3} />}
                            </button>
                          </Td>
                          <Td>
                            <p className={`font-semibold ${paid ? 'text-muted line-through' : 'text-title'}`}>{bill.name}</p>
                            {bill.reminderDaysBefore > 0 && (
                              <p className="mt-0.5 text-xs text-muted">{bill.reminderDaysBefore}d {t('bills.reminderLabel')}</p>
                            )}
                          </Td>
                          <Td className="hidden sm:table-cell">
                            {paid ? <Badge tone="success">{t('bills.status_paid')}</Badge>
                              : overdue ? <Badge tone="danger">{t('bills.status_overdue')}</Badge>
                              : <Badge tone="warning">{t('bills.status_pending')}</Badge>}
                          </Td>
                          <Td className={`hidden sm:table-cell ${overdue ? 'font-semibold text-danger' : 'text-muted'}`}>{formatDate(bill.dueDate)}</Td>
                          <Td className="text-end font-bold text-title">{formatMoney(bill.amount)}</Td>
                          <Td>
                            <div className="flex items-center justify-center">
                              <PreviewTip items={[
                                [t('bills.name'), bill.name],
                                [t('bills.amount'), formatMoney(bill.amount)],
                                [t('bills.dueDate'), formatDate(bill.dueDate)],
                                [t('bills.reminder'), bill.reminderDaysBefore || undefined],
                              ]} />
                              <IconButton icon="view" tone="strong" label={t('common.view')} onClick={() => navigate(`/bills/${bill.id}`)} />
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
            {(id) => <input id={id} type="search" value={filters.draft.search} onChange={(e) => filters.setDraft({ search: e.target.value })} placeholder={t('bills.search')} />}
          </FormField>
          <FormField label={t('common.status')}>
            {(id) => <AppSelect id={id} value={filters.draft.status} onChange={(v) => filters.setDraft({ status: v })} options={[
              { value: 'All', label: t('bills.filterAll') },
              { value: Status.Pending, label: t('bills.filterPending') },
              { value: Status.Paid, label: t('bills.filterPaid') },
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
