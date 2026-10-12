import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { dashboardService } from '../services/dashboard.service';
import { CATEGORY_I18N_KEYS } from '../utils/categoryLabel';
import { formatDate } from '../utils/formatDate';
import { formatMoney } from '../utils/formatMoney';
import { Status } from '../types/status';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatBox } from '../components/ui/StatBox';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, Th, Tr, Td } from '../components/ui/DataTable';
import { TodayFocus } from '../components/dashboard/TodayFocus';

// Recharts draws SVG attributes, so it gets the palette variables rather than Tailwind classes
const chartColor = { income: 'var(--c-primary)', expense: 'var(--c-line-strong)', net: 'var(--c-primary-dark)', alert: 'var(--c-danger)', muted: 'var(--c-muted)', line: 'var(--c-line)' };

function ProgressRing({ total, completed, overdue, label }: { total: number; completed: number; overdue: number; label: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? completed / total : 0;
  const doneDash = pct * circ;
  const overdueDash = total > 0 ? (overdue / total) * circ : 0;

  return (
    <svg width="136" height="136" viewBox="0 0 128 128" className="shrink-0">
      <g transform="rotate(-90 64 64)">
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="14" className="stroke-band" />
        {/* Overdue starts where completed ends, so the segments never overlap */}
        {overdue > 0 && (
          <circle cx="64" cy="64" r={r} fill="none" strokeWidth="14" className="stroke-danger"
            strokeDasharray={`${overdueDash} ${circ}`} strokeDashoffset={-doneDash} />
        )}
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="14" className="stroke-primary transition-[stroke-dasharray] duration-500"
          strokeDasharray={`${doneDash} ${circ}`} />
      </g>
      <text x="64" y="62" textAnchor="middle" className="fill-heading text-[22px] font-bold">{Math.round(pct * 100)}%</text>
      <text x="64" y="80" textAnchor="middle" className="fill-muted text-[10px]">{label}</text>
    </svg>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 30_000,
  });

  if (isLoading) return <MainLayout><PageLoader message={t('dashboard.loading')} /></MainLayout>;

  if (error) return (
    <MainLayout>
      <Card>
        <EmptyState icon="alert" title={t('dashboard.error')} hint={t('common.error')}
          action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />
      </Card>
    </MainLayout>
  );

  const d = data?.data;
  const net = d?.netBalance ?? 0;
  // Only a negative balance gets color
  const netColor = net >= 0 ? chartColor.net : chartColor.alert;

  return (
    <MainLayout>
      <PageHeader icon="dashboard" title={t('nav.dashboard')} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox label={t('dashboard.totalTasks')} value={d?.totalTasks ?? 0} icon="tasks" />
        <StatBox label={t('dashboard.completed')} value={d?.completedTasks ?? 0} icon="check" />
        <StatBox label={t('dashboard.pending')} value={d?.pendingTasks ?? 0} icon="clock" />
        <StatBox label={t('dashboard.overdue')} value={d?.overdueTasks ?? 0} icon="alert" alert={(d?.overdueTasks ?? 0) > 0} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatBox label={t('dashboard.totalIncome')} value={formatMoney(d?.totalIncome ?? 0)} icon="arrowUp" />
        <StatBox label={t('dashboard.totalExpenses')} value={formatMoney(d?.totalExpenses ?? 0)} icon="arrowDown" />
        <StatBox label={t('dashboard.netBalance')} value={formatMoney(net)} icon="wallet" alert={net < 0} />
      </div>

      <div className="mb-6"><TodayFocus nextBill={d?.upcomingBills?.[0]} /></div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card title={t('dashboard.financialOverview')} className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { name: t('dashboard.totalIncome'), value: d?.totalIncome ?? 0, color: chartColor.income },
                { name: t('dashboard.totalExpenses'), value: d?.totalExpenses ?? 0, color: chartColor.expense },
                { name: t('dashboard.netBalance'), value: Math.abs(net), color: netColor },
              ]}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke={chartColor.line} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartColor.muted }} axisLine={{ stroke: chartColor.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColor.muted }} axisLine={false} tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))} />
              <Tooltip
                cursor={{ fill: 'var(--c-hover)' }}
                contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', borderRadius: 6, fontSize: 12, color: 'var(--c-heading)' }}
                formatter={(v) => [formatMoney(Number(v)), '']}
              />
              <Bar dataKey="value" maxBarSize={56}>
                {[chartColor.income, chartColor.expense, netColor].map((fill, i) => <Cell key={i} fill={fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t('dashboard.taskProgress')} className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing total={d?.totalTasks ?? 0} completed={d?.completedTasks ?? 0} overdue={d?.overdueTasks ?? 0} label={t('dashboard.completed')} />
            <dl className="min-w-40 flex-1 divide-y divide-line rounded-md border border-line">
              {[
                { label: t('dashboard.completed'), value: d?.completedTasks ?? 0, dot: 'bg-primary' },
                { label: t('dashboard.pending'), value: d?.pendingTasks ?? 0, dot: 'bg-line-strong' },
                { label: t('dashboard.overdue'), value: d?.overdueTasks ?? 0, dot: 'bg-danger' },
                { label: t('dashboard.totalTasks'), value: d?.totalTasks ?? 0, dot: 'bg-primary-dark' },
              ].map(({ label, value, dot }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2">
                  <dt className="flex items-center gap-2 text-[13px] text-body"><span className={`size-2.5 rounded-sm ${dot}`} />{label}</dt>
                  <dd className="text-[13px] font-bold text-heading">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={t('dashboard.recentTasks')} padded={false}
          actions={<Link to="/tasks" className="text-sm font-semibold text-primary hover:underline">{t('dashboard.viewAll')}</Link>}>
          {d?.recentTasks?.length ? (
            <DataTable>
              <thead><tr><Th>{t('tasks.taskTitle')}</Th><Th>{t('tasks.category')}</Th><Th className="text-end">{t('common.status')}</Th></tr></thead>
              <tbody>
                {d.recentTasks.map((task) => (
                  <Tr key={task.id}>
                    <Td>{task.title}</Td>
                    <Td className="text-muted">{task.category ? t(CATEGORY_I18N_KEYS[task.category] ?? task.category) : '—'}</Td>
                    <Td className="text-end">
                      {task.statusCode === Status.Completed
                        ? <Badge tone="info">{t('tasks.filterCompleted')}</Badge>
                        : <Badge tone="neutral">{t('tasks.filterPending')}</Badge>}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <EmptyState icon="tasks" title={t('dashboard.noRecentTasks')} hint={t('tasks.noTasksHint')} />
          )}
        </Card>

        <Card title={t('dashboard.upcomingBills')} padded={false}
          actions={<Link to="/bills" className="text-sm font-semibold text-primary hover:underline">{t('dashboard.viewAll')}</Link>}>
          {d?.upcomingBills?.length ? (
            <DataTable>
              <thead><tr><Th>{t('bills.name')}</Th><Th>{t('bills.dueDate')}</Th><Th className="text-end">{t('bills.amount')}</Th></tr></thead>
              <tbody>
                {d.upcomingBills.map((bill) => (
                  <Tr key={bill.id}>
                    <Td>{bill.name}</Td>
                    <Td className="text-muted">{formatDate(bill.dueDate)}</Td>
                    <Td className="text-end font-bold text-title">{formatMoney(bill.amount)}</Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <EmptyState icon="bills" title={t('dashboard.noUpcomingBills')} hint={t('bills.noBillsHint')} />
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
