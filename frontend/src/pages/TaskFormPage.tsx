import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate, toDateKey } from '../utils/formatDate';
import { categoryOptions, TASK_CATEGORIES } from '../utils/categoryLabel';
import { taskService } from '../services/task.service';
import type { Task, CreateTaskRequest, TaskPriority } from '../types/task';
import { Status } from '../types/status';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { FormField } from '../components/ui/FormField';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { AppSelect } from '../components/ui/AppSelect';
import { DetailBar, FormPageActions, FormSection, RecordNotFound, StatusMenu } from '../components/ui/FormPage';
import { useToast } from '../components/ui/useToast';
import { useRecordId } from '../hooks/useRecordId';
import { useDirty } from '../hooks/useDirty';
import { compact, requiredKey, type FieldErrors } from '../utils/validation';

const emptyTask: CreateTaskRequest = { title: '', description: '', dueDate: '', category: '', priority: '' };

/** `/tasks/new` creates a task; `/tasks/:id` shows its details, editable. */
export default function TaskFormPage() {
  const { t } = useTranslation();
  const recordId = useRecordId();
  const { data, isLoading } = useQuery({ queryKey: ['tasks'], queryFn: () => taskService.getAllTasks(), enabled: recordId !== null });
  const task = data?.data?.find((x) => x.id === recordId);

  return (
    <MainLayout>
      <PageHeader icon="tasks" parent={{ label: t('tasks.title'), to: '/tasks' }}
        title={recordId === null ? t('tasks.createTask') : t('tasks.details')} />
      {recordId === null ? <TaskForm />
        : isLoading ? <PageLoader message={t('tasks.loading')} />
        : task ? <TaskForm key={task.id} task={task} />
        : <RecordNotFound icon="tasks" backTo="/tasks" />}
    </MainLayout>
  );
}

function TaskForm({ task }: { task?: Task }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateTaskRequest>(() => task ? {
    title: task.title,
    description: task.description ?? '',
    dueDate: task.dueDate ? toDateKey(task.dueDate) : '',
    category: task.category ?? '',
    priority: task.priority ?? '',
  } : emptyTask);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): FieldErrors<'title'> => compact({ title: requiredKey(form.title) });
  const errors = submitted ? validate() : {};
  const fieldError = (key: keyof typeof errors) => errors[key] && t(errors[key]!);

  const backToList = () => navigate('/tasks');
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => task ? taskService.updateTask({ ...form, id: task.id }) : taskService.createTask(form),
    onSuccess: () => { invalidate(); showToast(task ? t('tasks.updated') : t('tasks.created'), 'success'); backToList(); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const done = task?.statusCode === Status.Completed;
  const toggleMutation = useMutation({
    mutationFn: (current: Task) => current.statusCode === Status.Completed ? taskService.uncompleteTask(current.id) : taskService.completeTask(current.id),
    onSuccess: (_, current) => { invalidate(); showToast(current.statusCode === Status.Completed ? t('tasks.markedPending') : t('tasks.completedMsg'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => { invalidate(); showToast(t('tasks.deleted'), 'success'); backToList(); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate()).length) return;
    saveMutation.mutate();
  };
  const saving = saveMutation.isPending;
  const dirty = useDirty(form);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {task && (
        <DetailBar
          meta={t('common.createdOn', { date: formatDate(task.createdDate) })}
          status={<StatusMenu
            label={done ? t('tasks.filterCompleted') : t('tasks.filterPending')}
            tone={done ? 'success' : 'warning'}
            loading={toggleMutation.isPending}
            disabled={saving}
            options={[done
              ? { action: t('tasks.markPending'), target: t('tasks.filterPending'), targetTone: 'warning', onSelect: () => toggleMutation.mutate(task) }
              : { action: t('tasks.complete'), target: t('tasks.filterCompleted'), targetTone: 'success', onSelect: () => toggleMutation.mutate(task) }]}
          />}
        />
      )}
      <fieldset disabled={saving} className="min-w-0">
        <div className="space-y-4">
          <FormSection title={t('tasks.sectionInfo')}>
            <FormField label={t('tasks.taskTitle')} required error={fieldError('title')}>
              {(id) => <input id={id} type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('tasks.titlePlaceholder')} />}
            </FormField>
            <FormField label={t('tasks.dueDate')}>
              {(id) => <AppDatePicker id={id} value={form.dueDate ?? ''} onChange={(v) => setForm({ ...form, dueDate: v })} />}
            </FormField>
            <FormField label={t('tasks.category')}>
              {(id) => <AppSelect id={id} value={form.category ?? ''} onChange={(v) => setForm({ ...form, category: v })}
                placeholder={t('categories.placeholder')} options={categoryOptions(TASK_CATEGORIES, t)} />}
            </FormField>
            <FormField label={t('tasks.priority')}>
              {(id) => <AppSelect id={id} value={form.priority ?? ''} onChange={(v) => setForm({ ...form, priority: v as TaskPriority | '' })}
                placeholder={t('tasks.priorityNone')}
                options={[
                  { value: '', label: t('tasks.priorityNone') },
                  { value: 'High', label: t('tasks.priorityHigh') },
                  { value: 'Medium', label: t('tasks.priorityMedium') },
                  { value: 'Low', label: t('tasks.priorityLow') },
                ]} />}
            </FormField>
          </FormSection>
          <FormSection title={t('tasks.description')}>
            <FormField label={t('tasks.description')} className="md:col-span-2">
              {(id) => <textarea id={id} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('tasks.descriptionPlaceholder')} />}
            </FormField>
          </FormSection>
        </div>
      </fieldset>
      <FormPageActions onCancel={backToList} saving={saving} dirty={dirty} onDelete={task ? () => deleteMutation.mutateAsync(task.id) : undefined} submitIcon={task ? 'check' : 'plus'}
        submitLabel={task ? t('common.saveChanges') : t('tasks.createTask')} />
    </form>
  );
}
