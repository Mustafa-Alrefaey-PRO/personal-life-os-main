import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { taskService } from '../../services/task.service';
import { Status } from '../../types/status';
import type { Bill } from '../../types/bill';
import { formatDate, toDateKey, todayKey } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';

/** What needs attention today: overdue and due-today tasks, plus the next unpaid bill. */
export function TodayFocus({ nextBill }: { nextBill?: Bill }) {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ['tasks'], queryFn: () => taskService.getAllTasks() });
  const today = todayKey();

  const focus = (data?.data ?? [])
    .filter((task) => task.statusCode === Status.Pending && task.dueDate && toDateKey(task.dueDate) <= today)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 5);

  const nothingToDo = focus.length === 0 && !nextBill;

  return (
    <Card title={t('dashboard.todayFocus')} padded={false}
      actions={<Link to="/tasks" className="text-sm font-medium text-title hover:underline">{t('dashboard.viewAll')}</Link>}>
      {nothingToDo ? (
        <div className="flex items-center gap-3 px-5 py-6 text-sm text-muted">
          <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success"><Icon name="check" /></span>
          {t('dashboard.allCaughtUp')}
        </div>
      ) : (
        <ul className="divide-y divide-line-soft">
          {focus.map((task) => {
            const overdue = toDateKey(task.dueDate!) < today;
            return (
              <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors duration-150 hover:bg-hover">
                <div className="flex min-w-0 items-center gap-3">
                  <Icon name="tasks" className="size-5 shrink-0 text-title" strokeWidth={1.75} />
                  <span className="truncate text-[13px] font-semibold text-title">{task.title}</span>
                </div>
                <Badge tone={overdue ? 'danger' : 'neutral'}>
                  {overdue ? `${t('dashboard.overdue')} · ${formatDate(task.dueDate)}` : t('dashboard.dueToday')}
                </Badge>
              </li>
            );
          })}
          {nextBill && (
            <li className="flex items-center justify-between gap-3 px-5 py-3 transition-colors duration-150 hover:bg-hover">
              <div className="flex min-w-0 items-center gap-3">
                <Icon name="bills" className="size-5 shrink-0 text-title" strokeWidth={1.75} />
                <span className="truncate text-[13px] font-semibold text-title">{nextBill.name}</span>
                <span className="text-xs text-muted">{formatDate(nextBill.dueDate)}</span>
              </div>
              <Badge tone="neutral">{t('dashboard.nextBill')} · {formatMoney(nextBill.amount)}</Badge>
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}
