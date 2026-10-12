import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate, isInDateRange } from '../utils/formatDate';
import { formatMoney } from '../utils/formatMoney';
import { categoryLabel } from '../utils/categoryLabel';
import { receiptService } from '../services/receipt.service';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Badge } from '../components/ui/Badge';
import { Icon } from '../components/ui/Icon';
import { DataTable, Th, Tr, Td, EmptyRow } from '../components/ui/DataTable';
import { FormField } from '../components/ui/FormField';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { PreviewTip } from '../components/ui/PreviewTip';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { ReceiptImage } from '../components/ui/ReceiptImage';
import { Pagination } from '../components/ui/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';
import { FilterPanel, FilterToggle } from '../components/ui/FilterPanel';

export default function ReceiptsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = useFilters({ search: '', from: '', to: '' });
  const f = filters.applied;
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['receipts'], queryFn: () => receiptService.getAllReceipts() });

  const receipts = data?.data ?? [];
  const query = f.search.toLowerCase();
  const filtered = receipts
    .filter((r) => !query || r.title.toLowerCase().includes(query) || r.category?.toLowerCase().includes(query))
    .filter((r) => isInDateRange(r.date, f.from, f.to))
    .sort((a, b) => b.date.localeCompare(a.date));
  const { paged, paginationProps } = usePagination(filtered);
  const filteredTotal = filtered.reduce((sum, r) => sum + r.amount, 0);
  const hasFilters = filters.activeCount > 0;

  return (
    <MainLayout>
      <PageHeader
        icon="receipts"
        title={t('receipts.title')}
        subtitle={`${filtered.length} · ${t('receipts.total')}: ${formatMoney(filteredTotal)}`}
        actions={<><Button icon="plus" onClick={() => navigate('/receipts/new')}>{t('receipts.upload')}</Button><FilterToggle open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)} activeCount={filters.activeCount} /></>}
      />

      <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-0">
        <div className="w-full min-w-0 flex-1">
          <Card padded={false}>
            {isLoading ? <PageLoader message={t('receipts.loading')} /> : (
              <>
                <DataTable>
                  <thead>
                    <tr>
                      <Th className="w-20">{t('receipts.image')}</Th>
                      <Th>{t('receipts.receiptTitle')}</Th>
                      <Th className="hidden sm:table-cell">{t('receipts.category')}</Th>
                      <Th className="hidden sm:table-cell">{t('receipts.date')}</Th>
                      <Th className="text-end">{t('receipts.amount')}</Th>
                      <Th className="w-24">{t('common.details')}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && <EmptyRow colSpan={6} title={hasFilters ? t('receipts.noResults') : t('receipts.noReceipts')} hint={hasFilters ? t('receipts.noResultsHint') : t('receipts.noReceiptsHint')} action={!hasFilters && <Button icon="plus" onClick={() => navigate('/receipts/new')}>{t('receipts.upload')}</Button>} />}
                    {paged.map((receipt) => (
                      <Tr key={receipt.id}>
                        <Td>
                          {receipt.hasImage ? (
                            <ReceiptImage receiptId={receipt.id} alt={receipt.title} className="size-11 rounded-md"
                              onClick={(src) => setPreviewImage({ src, title: receipt.title })} />
                          ) : (
                            <div className="flex size-11 items-center justify-center rounded-md border border-line bg-band text-muted">
                              <Icon name="image" />
                            </div>
                          )}
                        </Td>
                        <Td>{receipt.title}</Td>
                        <Td className="hidden sm:table-cell">{receipt.category ? <Badge>{categoryLabel(receipt.category, t)}</Badge> : <span className="text-muted">—</span>}</Td>
                        <Td className="hidden text-muted sm:table-cell">{formatDate(receipt.date)}</Td>
                        <Td className="text-end font-bold whitespace-nowrap text-title">{formatMoney(receipt.amount)}</Td>
                        <Td>
                          <div className="flex items-center justify-center">
                            <PreviewTip items={[
                              [t('receipts.receiptTitle'), receipt.title],
                              [t('receipts.category'), receipt.category && categoryLabel(receipt.category, t)],
                              [t('receipts.amount'), formatMoney(receipt.amount)],
                              [t('receipts.date'), formatDate(receipt.date)],
                            ]} />
                            <IconButton icon="view" tone="strong" label={t('common.view')} onClick={() => navigate(`/receipts/${receipt.id}`)} />
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </DataTable>
              </>
            )}
          </Card>
          <Pagination {...paginationProps} />

        </div>
        <FilterPanel open={filterOpen} onApply={filters.apply} onClear={filters.clear}>
          <FormField label={t('filters.keyword')}>
            {(id) => <input id={id} type="search" value={filters.draft.search} onChange={(e) => filters.setDraft({ search: e.target.value })} placeholder={t('receipts.search')} />}
          </FormField>
          <FormField label={t('common.dateFrom')}>
            {(id) => <AppDatePicker id={id} value={filters.draft.from} onChange={(v) => filters.setDraft({ from: v })} />}
          </FormField>
          <FormField label={t('common.dateTo')}>
            {(id) => <AppDatePicker id={id} value={filters.draft.to} onChange={(v) => filters.setDraft({ to: v })} />}
          </FormField>
        </FilterPanel>
      </div>


      <ImageLightbox image={previewImage} onClose={() => setPreviewImage(null)} />
    </MainLayout>
  );
}
