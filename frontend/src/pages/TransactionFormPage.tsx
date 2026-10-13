import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toDateKey, todayKey } from '../utils/formatDate';
import { categoryOptions, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categoryLabel';
import { formatMoney } from '../utils/formatMoney';
import { transactionService } from '../services/transaction.service';
import type { Transaction, CreateTransactionRequest, TransactionType } from '../types/transaction';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { FormField } from '../components/ui/FormField';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { AppSelect } from '../components/ui/AppSelect';
import { FormPageActions, FormSection, RecordNotFound } from '../components/ui/FormPage';
import { useToast } from '../components/ui/useToast';
import { useRecordId } from '../hooks/useRecordId';
import { useDirty } from '../hooks/useDirty';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { compact, positiveAmountKey, requiredKey, type FieldErrors } from '../utils/validation';

// A function so "today" is computed in local time when the page opens, not once at load
const emptyForm = (): CreateTransactionRequest => ({ amount: 0, type: 'Expense', category: '', date: todayKey(), notes: '' });

/** `/transactions/new` adds a transaction; `/transactions/:id` shows its details, editable. */
export default function TransactionFormPage() {
  const { t } = useTranslation();
  const recordId = useRecordId();
  const { data, isLoading } = useQuery({ queryKey: ['transactions'], queryFn: () => transactionService.getAllTransactions(), enabled: recordId !== null });
  const tx = data?.data?.find((x) => x.id === recordId);

  return (
    <MainLayout>
      <PageHeader icon="transactions" parent={{ label: t('transactions.title'), to: '/transactions' }}
        title={recordId === null ? t('transactions.addTransaction') : t('transactions.details')} />
      {recordId === null ? <TransactionForm />
        : isLoading ? <PageLoader message={t('transactions.loading')} />
        : tx ? <TransactionForm key={tx.id} tx={tx} />
        : <RecordNotFound icon="transactions" backTo="/transactions" />}
    </MainLayout>
  );
}

function TransactionForm({ tx }: { tx?: Transaction }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateTransactionRequest>(() => tx
    ? { amount: tx.amount, type: tx.type, category: tx.category ?? '', date: toDateKey(tx.date), notes: tx.notes ?? '' }
    : emptyForm());
  const [submitted, setSubmitted] = useState(false);

  const validate = (): FieldErrors<'amount' | 'date'> => compact({ amount: positiveAmountKey(form.amount), date: requiredKey(form.date) });
  const errors = submitted ? validate() : {};
  const fieldError = (key: keyof typeof errors) => errors[key] && t(errors[key]!);

  const backToList = () => navigate('/transactions');
  const undoableDelete = useUndoableDelete();
  // Hidden at once with an Undo toast; the delete is sent when the toast closes.
  const remove = async () => {
    if (!tx) return;
    undoableDelete({ section: 'transactions', id: tx.id, name: `${tx.type === 'Income' ? t('transactions.income') : t('transactions.expense')} · ${formatMoney(tx.amount)}`, remove: () => transactionService.deleteTransaction(tx.id) });
    backToList();
  };
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => tx ? transactionService.updateTransaction(tx.id, { ...form, id: tx.id }) : transactionService.createTransaction(form),
    onSuccess: () => { invalidate(); showToast(tx ? t('transactions.updated') : t('transactions.created'), 'success'); backToList(); },
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
      <fieldset disabled={saving} className="min-w-0">
        <div className="space-y-4">
          <FormSection title={t('transactions.sectionInfo')}>
            <div className="md:col-span-2">
              <SegmentedControl<TransactionType>
                label={t('transactions.type')}
                value={form.type}
                onChange={(type) => setForm({ ...form, type, category: '' })}
                options={[
                  { value: 'Income', label: t('transactions.income') },
                  { value: 'Expense', label: t('transactions.expense') },
                ]}
              />
            </div>
            <FormField label={t('transactions.amount')} required error={fieldError('amount')}>
              {(id) => <input id={id} type="number" required min="0.01" step="0.01" value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" />}
            </FormField>
            <FormField label={t('transactions.date')} required error={fieldError('date')}>
              {(id) => <AppDatePicker id={id} value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />}
            </FormField>
            <FormField label={t('transactions.category')}>
              {(id) => <AppSelect id={id} value={form.category ?? ''} onChange={(v) => setForm({ ...form, category: v })}
                placeholder={t('categories.placeholder')}
                options={categoryOptions(form.type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES, t)} />}
            </FormField>
          </FormSection>
          <FormSection title={t('transactions.notes')}>
            <FormField label={t('transactions.notes')} className="md:col-span-2">
              {(id) => <textarea id={id} rows={3} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t('transactions.notesPlaceholder')} />}
            </FormField>
          </FormSection>
        </div>
      </fieldset>
      <FormPageActions onCancel={backToList} saving={saving} dirty={dirty} onDelete={tx ? remove : undefined} confirmDelete={false} submitIcon={tx ? 'check' : 'plus'}
        submitLabel={tx ? t('common.saveChanges') : t('transactions.addTransaction')} />
    </form>
  );
}
