import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate, isInDateRange } from '../utils/formatDate';
import { categoryLabel } from '../utils/categoryLabel';
import { taskService } from '../services/task.service';
import type { Task, TaskPriority } from '../types/task';
import { Status } from '../types/status';
import { MainLayout } from '../components/layout/MainLayout';
import { Spinner } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Badge, type BadgeTone } from '../components/ui/Badge';
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

const priorityTone: Record<TaskPriority, BadgeTone> = { High: 'danger', Medium: 'warning', Low: 'success' };

export default function TasksPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = useFilters({ search: '', status: 'All', priority: 'All', from: '', to: '' });
  const f = filters.applied;
  const [completingId, setCompletingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['tasks'], queryFn: () => taskService.getAllTasks() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const toggleMutation = useMutation({
    mutationFn: (task: Task) =>
      task.statusCode === Status.Completed ? taskService.uncompleteTask(task.id) : taskService.completeTask(task.id),
    onMutate: (task) => setCompletingId(task.id),
    onSuccess: (_, task) => {
      invalidate();
      showToast(task.statusCode === Status.Completed ? t('tasks.markedPending') : t('tasks.completedMsg'), 'success');
    },
    onError: () => showToast(t('common.error'), 'error'),
    onSettled: () => setCompletingId(null),
  });

  // Rows with a pending delete (Undo toast showing) stay hidden
  const tasks = useWithoutPending('tasks', data?.data ?? []);
  const query = f.search.toLowerCase();
  const filtered = tasks
    .filter((task) => f.status === 'All' || task.statusCode === f.status)
    .filter((task) => f.priority === 'All' || (task.priority ?? '') === f.priority)
    .filter((task) => !query || task.title.toLowerCase().includes(query) || task.category?.toLowerCase().includes(query))
    .filter((task) => isInDateRange(task.dueDate, f.from, f.to));
  const { paged, paginationProps } = usePagination(filtered);
  const hasFilters = filters.activeCount > 0;
  const priorityLabel = (p: TaskPriority) => t(`tasks.priority${p}`);

  return (
    <MainLayout>
      <PageHeader
        icon="tasks"
        title={t('tasks.title')}
        subtitle={`${tasks.length} ${t('tasks.total')}`}
        actions={<><Button icon="tasks" onClick={() => navigate('/tasks/new')}>{t('tasks.createTask')}</Button><FilterToggle open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)} activeCount={filters.activeCount} /></>}
      />

      <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-0">
        <div className="w-full min-w-0 flex-1">
          <Card padded={false}>
            {isLoading ? <TableSkeleton label={t('tasks.loading')} /> : (
              <>
                <DataTable>
                  <thead>
                    <tr>
                      <Th className="w-12" />
                      <Th>{t('tasks.taskTitle')}</Th>
                      <Th className="hidden sm:table-cell">{t('tasks.category')}</Th>
                      <Th className="hidden sm:table-cell">{t('tasks.priority')}</Th>
                      <Th className="hidden md:table-cell">{t('tasks.dueDate')}</Th>
                      <Th className="hidden lg:table-cell">{t('common.status')}</Th>
                      <Th className="w-24">{t('common.details')}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && <EmptyRow colSpan={7} title={hasFilters ? t('tasks.noResults') : t('tasks.noTasks')} hint={hasFilters ? t('tasks.noResultsHint') : t('tasks.noTasksHint')} action={!hasFilters && <Button icon="tasks" onClick={() => navigate('/tasks/new')}>{t('tasks.createTask')}</Button>} />}
                    {paged.map((task) => {
                      const done = task.statusCode === Status.Completed;
                      return (
                        <Tr key={task.id}>
                          <Td>
                            <button
                              type="button"
                              onClick={() => toggleMutation.mutate(task)}
                              disabled={completingId === task.id}
                              title={done ? t('tasks.markPending') : t('tasks.complete')}
                              aria-label={done ? t('tasks.markPending') : t('tasks.complete')}
                              className={`flex size-5 items-center justify-center rounded border-2 transition-colors ${
                                done ? 'border-success bg-success text-on-primary' : 'border-line-strong text-transparent hover:border-success'
                              }`}
                            >
                              {completingId === task.id ? <Spinner size="sm" className="border-current/30 border-t-current" /> : <Icon name="check" className="size-3" strokeWidth={3} />}
                            </button>
                          </Td>
                          <Td>
                            <p className={`font-semibold ${done ? 'text-muted line-through' : 'text-title'}`}>{task.title}</p>
                            {task.description && <p className="mt-0.5 max-w-xs truncate text-xs text-muted">{task.description}</p>}
                          </Td>
                          <Td className="hidden sm:table-cell">{task.category ? <Badge>{categoryLabel(task.category, t)}</Badge> : <span className="text-muted">—</span>}</Td>
                          <Td className="hidden sm:table-cell">{task.priority ? <Badge tone={priorityTone[task.priority]}>{priorityLabel(task.priority)}</Badge> : <span className="text-muted">—</span>}</Td>
                          <Td className="hidden text-muted md:table-cell">{formatDate(task.dueDate)}</Td>
                          <Td className="hidden lg:table-cell">
                            {done ? <Badge tone="success">{t('tasks.filterCompleted')}</Badge> : <Badge tone="warning">{t('tasks.filterPending')}</Badge>}
                          </Td>
                          <Td>
                            <div className="flex items-center justify-center">
                              <PreviewTip items={[
                                [t('tasks.taskTitle'), task.title],
                                [t('tasks.category'), task.category && categoryLabel(task.category, t)],
                                [t('tasks.priority'), task.priority && priorityLabel(task.priority)],
                                [t('tasks.dueDate'), task.dueDate && formatDate(task.dueDate)],
                              ]} />
                              <IconButton icon="view" tone="strong" label={t('common.view')} onClick={() => navigate(`/tasks/${task.id}`)} />
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
            {(id) => <input id={id} type="search" value={filters.draft.search} onChange={(e) => filters.setDraft({ search: e.target.value })} placeholder={t('tasks.search')} />}
          </FormField>
          <FormField label={t('common.status')}>
            {(id) => <AppSelect id={id} value={filters.draft.status} onChange={(v) => filters.setDraft({ status: v })} options={[
              { value: 'All', label: t('tasks.filterAll') },
              { value: Status.Pending, label: t('tasks.filterPending') },
              { value: Status.Completed, label: t('tasks.filterCompleted') },
            ]} />}
          </FormField>
          <FormField label={t('tasks.priority')}>
            {(id) => <AppSelect id={id} value={filters.draft.priority} onChange={(v) => filters.setDraft({ priority: v })} options={[
              { value: 'All', label: t('tasks.filterPriorityAll') },
              { value: 'High', label: t('tasks.priorityHigh') },
              { value: 'Medium', label: t('tasks.priorityMedium') },
              { value: 'Low', label: t('tasks.priorityLow') },
              { value: '', label: t('tasks.priorityNone') },
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
