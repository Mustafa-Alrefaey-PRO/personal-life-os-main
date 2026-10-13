import { useTranslation } from 'react-i18next';
import { AppDatePicker } from './AppDatePicker';
import { Button } from './Button';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangeFilter({ from, to, onFromChange, onToChange }: DateRangeFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-title">{t('common.dateFrom')}</span>
      <div className="w-40"><AppDatePicker value={from} onChange={onFromChange} placeholder={t('common.dateFrom')} /></div>
      <span className="text-sm font-medium text-title">{t('common.dateTo')}</span>
      <div className="w-40"><AppDatePicker value={to} onChange={onToChange} placeholder={t('common.dateTo')} /></div>
      {(from || to) && (
        <Button variant="secondary" icon="x" onClick={() => { onFromChange(''); onToChange(''); }}>
          {t('common.clearFilters')}
        </Button>
      )}
    </div>
  );
}
