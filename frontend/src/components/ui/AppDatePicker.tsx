import { forwardRef, useState } from 'react';
import DatePicker, { registerLocale, type ReactDatePickerCustomHeaderProps } from 'react-datepicker';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

// Arabic month/day names in the calendar when the UI is in Arabic
registerLocale('ar', ar);

const AR_WEEKDAY_LETTER: Record<string, string> = {
  'السبت': 'س', 'الأحد': 'ح', 'الاثنين': 'ن', 'الإثنين': 'ن', 'الثلاثاء': 'ث', 'الأربعاء': 'ر', 'الخميس': 'خ', 'الجمعة': 'ج',
};

/** One letter per weekday column: S M T W T F S / س ح ن ث ر خ ج */
const weekdayLetter = (name: string) => AR_WEEKDAY_LETTER[name] ?? name.charAt(0).toUpperCase();

type CalendarView = 'days' | 'months' | 'years';

// Years per page in the year grid (4 × 3, like the month grid's rhythm)
const YEARS_PER_PAGE = 12;

interface CalendarHeaderProps extends ReactDatePickerCustomHeaderProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

/**
 * Pill with the month and the year: clicking the month opens the month grid, clicking the year the year grid.
 * The arrows step by month (days), by year (months) or by a page of years (years).
 */
function CalendarHeader({ date, view, onViewChange, decreaseMonth, increaseMonth, decreaseYear, increaseYear }: CalendarHeaderProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? ar : enUS;
  const arrow = 'inline-flex size-9 items-center justify-center rounded-full text-title transition-colors duration-150 hover:bg-hover';
  const part = (active: boolean) => `rounded-full px-3 py-1 transition-colors duration-150 hover:bg-surface/70 ${active ? 'bg-surface/80' : ''}`;
  const prev = view === 'days' ? decreaseMonth : decreaseYear;
  const next = view === 'days' ? increaseMonth : increaseYear;

  return (
    <div className="mb-3 flex items-center justify-between gap-2 px-1">
      <button type="button" onClick={prev} aria-label={t('pagination.previous')} className={arrow}>
        <Icon name="chevronLeft" className="size-5 rtl:rotate-180" />
      </button>
      <div className="flex min-w-48 items-center justify-center gap-2 rounded-full bg-primary-soft px-2 py-1 text-base font-medium text-title">
        <button type="button" onClick={() => onViewChange(view === 'months' ? 'days' : 'months')} aria-pressed={view === 'months'} className={part(view === 'months')}>
          {format(date, 'LLLL', { locale })}
        </button>
        <button type="button" onClick={() => onViewChange(view === 'years' ? 'days' : 'years')} aria-pressed={view === 'years'} className={part(view === 'years')}>
          {date.getFullYear()}
        </button>
      </div>
      <button type="button" onClick={next} aria-label={t('pagination.next')} className={arrow}>
        <Icon name="chevronRight" className="size-5 rtl:rotate-180" />
      </button>
    </div>
  );
}

interface AppDatePickerProps {
  value: string;          // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  minDate?: Date;
  id?: string;
}

// Bare input (no wrapper) so the popper anchors to the ref element
const DateInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ value, onClick, placeholder, required, onFocus, onBlur, id }, ref) => (
    <input
      ref={ref}
      id={id}
      type="text"
      readOnly
      required={required}
      value={(value as string) || ''}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className="cursor-pointer ps-9 pe-8"
    />
  ),
);
DateInput.displayName = 'DateInput';

export function AppDatePicker({ value, onChange, placeholder, required, minDate, id }: AppDatePickerProps) {
  const { t, i18n } = useTranslation();
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [view, setView] = useState<CalendarView>('days');

  const emit = (date: Date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    onChange(`${date.getFullYear()}-${m}-${d}`);
  };

  return (
    <div className="relative w-full">
      <Icon name="calendar" className="pointer-events-none absolute start-3 top-1/2 z-[1] size-4 -translate-y-1/2 text-muted" />
      <DatePicker
        selected={selected}
        onChange={(date: Date | null) => {
          if (!date) return;
          // In the month/year grids a click only navigates: year → months → days
          if (view === 'years') setView('months');
          else if (view === 'months') setView('days');
          else emit(date);
        }}
        showMonthYearPicker={view === 'months'}
        showYearPicker={view === 'years'}
        yearItemNumber={YEARS_PER_PAGE}
        shouldCloseOnSelect={view === 'days'}
        onCalendarClose={() => setView('days')}
        dateFormat="dd/MM/yyyy"
        locale={i18n.language === 'ar' ? 'ar' : undefined}
        formatWeekDay={weekdayLetter}
        renderCustomHeader={(props) => <CalendarHeader {...props} view={view} onViewChange={setView} />}
        placeholderText={placeholder ?? t('common.selectDate')}
        customInput={<DateInput id={id} />}
        minDate={minDate}
        required={required}
        autoComplete="off"
        wrapperClassName="w-full"
        popperPlacement="bottom-start"
        // Render the calendar in <body> so overflow on modals/cards never clips it
        portalId="floating-root"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          title={t('common.clearDate')}
          aria-label={t('common.clearDate')}
          className="absolute end-2 top-1/2 z-10 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted hover:text-heading"
        >
          <Icon name="x" className="size-3.5" />
        </button>
      )}
    </div>
  );
}
