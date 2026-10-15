import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate, toDateKey, todayKey, formatDateLong } from '../utils/formatDate';
import { journalService } from '../services/journal.service';
import { getApiErrorMessage } from '../services/api';
import type { JournalEntry } from '../types/journal';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { FormField } from '../components/ui/FormField';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { DetailBar, FormPageActions, FormSection, RecordNotFound } from '../components/ui/FormPage';
import { useToast } from '../components/ui/useToast';
import { useRecordId } from '../hooks/useRecordId';
import { useDirty } from '../hooks/useDirty';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { compact, requiredKey, type FieldErrors } from '../utils/validation';

/** `/journal/new` writes an entry; `/journal/:id` shows it, editable. */
export default function JournalFormPage() {
  const { t } = useTranslation();
  const recordId = useRecordId();
  const { data, isLoading } = useQuery({ queryKey: ['journal'], queryFn: () => journalService.getAllJournals(), enabled: recordId !== null });
  const entry = data?.data?.find((x) => x.id === recordId);

  return (
    <MainLayout>
      <PageHeader icon="journal" parent={{ label: t('journal.title'), to: '/journal' }}
        title={recordId === null ? t('journal.newEntry') : t('journal.details')} />
      {recordId === null ? <JournalForm />
        : isLoading ? <PageLoader message={t('journal.loading')} />
        : entry ? <JournalForm key={entry.id} entry={entry} />
        : <RecordNotFound icon="journal" backTo="/journal" />}
    </MainLayout>
  );
}

function JournalForm({ entry }: { entry?: JournalEntry }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  // A function so "today" is computed in local time when the page opens
  const [form, setForm] = useState(() => entry ? { date: toDateKey(entry.date), notes: entry.notes } : { date: todayKey(), notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const validate = (): FieldErrors<'date' | 'notes'> => compact({ date: requiredKey(form.date), notes: requiredKey(form.notes) });
  const errors = submitted ? validate() : {};
  const fieldError = (key: keyof typeof errors) => errors[key] && t(errors[key]!);

  const backToList = () => navigate('/journal');
  const undoableDelete = useUndoableDelete();
  // Hidden at once with an Undo toast; the delete is sent when the toast closes.
  const remove = async () => {
    if (!entry) return;
    undoableDelete({ section: 'journal', id: entry.id, name: formatDateLong(entry.date, i18n.language), remove: () => journalService.deleteJournal(entry.id) });
    backToList();
  };
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['journal'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => entry
      ? journalService.updateJournal(entry.id, { id: entry.id, ...form })
      : journalService.createJournal(form),
    onSuccess: () => { invalidate(); showToast(entry ? t('journal.updated') : t('journal.saved'), 'success'); backToList(); },
    // e.g. "an entry already exists for this date" (one entry per day)
    onError: (err) => showToast(getApiErrorMessage(err, t('common.error')), 'error'),
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
      {entry && <DetailBar meta={t('common.createdOn', { date: formatDate(entry.createdDate) })} />}
      <fieldset disabled={saving} className="min-w-0">
        <FormSection title={t('journal.sectionInfo')}>
          <FormField label={t('journal.date')} required error={fieldError('date')}>
            {(id) => <AppDatePicker id={id} value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />}
          </FormField>
          <div className="max-md:hidden" />
          <FormField label={t('journal.notes')} required error={fieldError('notes')} className="md:col-span-2">
            {(id) => <textarea id={id} required rows={10} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t('journal.notesPlaceholder')} className="resize-y" />}
          </FormField>
        </FormSection>
      </fieldset>
      <FormPageActions onCancel={backToList} saving={saving} dirty={dirty} onDelete={entry ? remove : undefined} undoable submitIcon={entry ? 'check' : 'journal'}
        submitLabel={entry ? t('journal.saveChanges') : t('journal.save')} />
    </form>
  );
}
