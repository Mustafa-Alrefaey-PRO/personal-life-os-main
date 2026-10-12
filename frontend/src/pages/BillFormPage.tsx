import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toDateKey, todayKey } from '../utils/formatDate';
import { billService } from '../services/bill.service';
import type { Bill, CreateBillRequest } from '../types/bill';
import { Status } from '../types/status';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { FormField } from '../components/ui/FormField';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { DetailBar, FormPageActions, FormSection, RecordNotFound, StatusMenu } from '../components/ui/FormPage';
import { useToast } from '../components/ui/useToast';
import { useRecordId } from '../hooks/useRecordId';
import { useDirty } from '../hooks/useDirty';
import { compact, positiveAmountKey, requiredKey, type FieldErrors } from '../utils/validation';

const emptyForm: CreateBillRequest = { name: '', amount: 0, dueDate: '', reminderDaysBefore: 3 };

/** `/bills/new` adds a bill; `/bills/:id` shows its details, editable. */
export default function BillFormPage() {
  const { t } = useTranslation();
  const recordId = useRecordId();
  const { data, isLoading } = useQuery({ queryKey: ['bills'], queryFn: () => billService.getAllBills(), enabled: recordId !== null });
  const bill = data?.data?.find((x) => x.id === recordId);

  return (
    <MainLayout>
      <PageHeader icon="bills" parent={{ label: t('bills.title'), to: '/bills' }}
        title={recordId === null ? t('bills.addBill') : t('bills.details')} />
      {recordId === null ? <BillForm />
        : isLoading ? <PageLoader message={t('bills.loading')} />
        : bill ? <BillForm key={bill.id} bill={bill} />
        : <RecordNotFound icon="bills" backTo="/bills" />}
    </MainLayout>
  );
}

function BillForm({ bill }: { bill?: Bill }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateBillRequest>(() => bill
    ? { name: bill.name, amount: bill.amount, dueDate: toDateKey(bill.dueDate), reminderDaysBefore: bill.reminderDaysBefore }
    : emptyForm);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): FieldErrors<'name' | 'amount' | 'dueDate'> =>
    compact({ name: requiredKey(form.name), amount: positiveAmountKey(form.amount), dueDate: requiredKey(form.dueDate) });
  const errors = submitted ? validate() : {};
  const fieldError = (key: keyof typeof errors) => errors[key] && t(errors[key]!);

  const backToList = () => navigate('/bills');
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => bill ? billService.updateBill(bill.id, { ...form, id: bill.id }) : billService.createBill(form),
    onSuccess: () => { invalidate(); showToast(bill ? t('bills.updated') : t('bills.created'), 'success'); backToList(); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const togglePaidMutation = useMutation({
    mutationFn: (current: Bill) => current.statusCode === Status.Paid ? billService.markAsUnpaid(current.id) : billService.markAsPaid(current.id),
    onSuccess: (_, current) => { invalidate(); showToast(current.statusCode === Status.Paid ? t('bills.unpaid') : t('bills.paid'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => billService.deleteBill(id),
    onSuccess: () => { invalidate(); showToast(t('bills.deleted'), 'success'); backToList(); },
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
  const paid = bill?.statusCode === Status.Paid;
  const overdue = bill?.statusCode === Status.Pending && toDateKey(bill.dueDate) < todayKey();

  return (
    <form onSubmit={handleSubmit} noValidate>
      {bill && (
        <DetailBar
          status={<StatusMenu
            label={paid ? t('bills.status_paid') : overdue ? t('bills.status_overdue') : t('bills.status_pending')}
            tone={paid ? 'success' : overdue ? 'danger' : 'warning'}
            loading={togglePaidMutation.isPending}
            disabled={saving}
            options={[paid
              ? { action: t('bills.markUnpaid'), target: t('bills.status_pending'), targetTone: 'warning', onSelect: () => togglePaidMutation.mutate(bill) }
              : { action: t('bills.pay'), target: t('bills.status_paid'), targetTone: 'success', onSelect: () => togglePaidMutation.mutate(bill) }]}
          />}
        />
      )}
      <fieldset disabled={saving} className="min-w-0">
        <div className="space-y-4">
          <FormSection title={t('bills.sectionInfo')}>
            <FormField label={t('bills.name')} required error={fieldError('name')}>
              {(id) => <input id={id} type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('bills.namePlaceholder')} />}
            </FormField>
            <FormField label={t('bills.amount')} required error={fieldError('amount')}>
              {(id) => <input id={id} type="number" required min="0.01" step="0.01" value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" />}
            </FormField>
          </FormSection>
          <FormSection title={t('bills.sectionSchedule')}>
            <FormField label={t('bills.dueDate')} required error={fieldError('dueDate')}>
              {(id) => <AppDatePicker id={id} value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} required />}
            </FormField>
            <FormField label={t('bills.reminder')}>
              {(id) => <input id={id} type="number" min="0" max="365" value={form.reminderDaysBefore}
                onChange={(e) => setForm({ ...form, reminderDaysBefore: parseInt(e.target.value) || 0 })} />}
            </FormField>
          </FormSection>
        </div>
      </fieldset>
      <FormPageActions onCancel={backToList} saving={saving} dirty={dirty} onDelete={bill ? () => deleteMutation.mutateAsync(bill.id) : undefined} submitIcon={bill ? 'check' : 'plus'}
        submitLabel={bill ? t('common.saveChanges') : t('bills.addBill')} />
    </form>
  );
}
