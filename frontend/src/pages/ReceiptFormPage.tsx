import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate, toDateKey, todayKey } from '../utils/formatDate';
import { categoryOptions, RECEIPT_CATEGORIES } from '../utils/categoryLabel';
import { receiptService } from '../services/receipt.service';
import { getApiErrorMessage } from '../services/api';
import type { Receipt, CreateReceiptRequest } from '../types/receipt';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { FormField } from '../components/ui/FormField';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { AppSelect } from '../components/ui/AppSelect';
import { ReceiptImage } from '../components/ui/ReceiptImage';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { ProgressBar } from '../components/ui/ProgressBar';
import { DetailBar, FormPageActions, FormSection, RecordNotFound } from '../components/ui/FormPage';
import { useToast } from '../components/ui/useToast';
import { useRecordId } from '../hooks/useRecordId';
import { useDirty } from '../hooks/useDirty';
import { compact, positiveAmountKey, requiredKey, type FieldErrors } from '../utils/validation';

const IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

/** `/receipts/new` uploads a receipt; `/receipts/:id` shows its details and image, editable. */
export default function ReceiptFormPage() {
  const { t } = useTranslation();
  const recordId = useRecordId();
  const { data, isLoading } = useQuery({ queryKey: ['receipts'], queryFn: () => receiptService.getAllReceipts(), enabled: recordId !== null });
  const receipt = data?.data?.find((x) => x.id === recordId);

  return (
    <MainLayout>
      <PageHeader icon="receipts" parent={{ label: t('receipts.title'), to: '/receipts' }}
        title={recordId === null ? t('receipts.upload') : t('receipts.details')} />
      {recordId === null ? <ReceiptForm />
        : isLoading ? <PageLoader message={t('receipts.loading')} />
        : receipt ? <ReceiptForm key={receipt.id} receipt={receipt} />
        : <RecordNotFound icon="receipts" backTo="/receipts" />}
    </MainLayout>
  );
}

function ReceiptForm({ receipt }: { receipt?: Receipt }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  // A function so "today" is computed in local time when the page opens
  const [form, setForm] = useState<CreateReceiptRequest>(() => receipt
    ? { title: receipt.title, amount: receipt.amount, date: toDateKey(receipt.date), category: receipt.category ?? '' }
    : { title: '', amount: 0, date: todayKey(), category: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imageVersion, setImageVersion] = useState(0);
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const validate = (): FieldErrors<'title' | 'amount' | 'date' | 'image'> => compact({
    title: requiredKey(form.title),
    amount: positiveAmountKey(form.amount),
    date: requiredKey(form.date),
    image: receipt || imageFile ? undefined : 'validation.required',
  });
  const errors = submitted ? validate() : {};
  const fieldError = (key: keyof typeof errors) => errors[key] && t(errors[key]!);

  const backToList = () => navigate('/receipts');
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['receipts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => receipt
      ? receiptService.updateReceipt(receipt.id, { ...form, id: receipt.id })
      : receiptService.createReceipt(form, imageFile!, setUploadProgress),
    onMutate: () => { if (!receipt) setUploadProgress(0); },
    onSuccess: () => { invalidate(); showToast(receipt ? t('receipts.updated') : t('receipts.uploaded'), 'success'); backToList(); },
    // Show the server's reason, e.g. an unsupported image type
    onError: (err) => { setUploadProgress(null); showToast(getApiErrorMessage(err, t('common.error')), 'error'); },
  });

  // Replacing the image of an existing receipt saves straight away, separately from the fields
  const updateImageMutation = useMutation({
    mutationFn: (file: File) => receiptService.updateReceiptImage(receipt!.id, file, setUploadProgress),
    onMutate: () => setUploadProgress(0),
    onSuccess: () => { invalidate(); setImageVersion((v) => v + 1); showToast(t('receipts.imageUpdated'), 'success'); },
    onError: (err) => showToast(getApiErrorMessage(err, t('common.error')), 'error'),
    onSettled: () => setUploadProgress(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => receiptService.deleteReceipt(id),
    // No Undo: deleting a receipt also deletes its image file, so it is confirmed first instead
    onSuccess: () => { invalidate(); showToast(t('common.deletedNamed', { name: receipt?.title ?? '' }), 'neutral'); backToList(); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate()).length) return;
    saveMutation.mutate();
  };
  const saving = saveMutation.isPending;
  const dirty = useDirty({ form, image: imageFile?.name });

  return (
    <form onSubmit={handleSubmit} noValidate>
      {receipt && <DetailBar meta={t('common.createdOn', { date: formatDate(receipt.createdDate) })} />}
      <fieldset disabled={saving || updateImageMutation.isPending} className="min-w-0">
        <div className="space-y-4">
          <FormSection title={t('receipts.sectionInfo')}>
            <FormField label={t('receipts.receiptTitle')} required error={fieldError('title')}>
              {(id) => <input id={id} type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('receipts.titlePlaceholder')} />}
            </FormField>
            <FormField label={t('receipts.amount')} required error={fieldError('amount')}>
              {(id) => <input id={id} type="number" required min="0.01" step="0.01" value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} placeholder={t('common.amountPlaceholder')} />}
            </FormField>
            <FormField label={t('receipts.date')} required error={fieldError('date')}>
              {(id) => <AppDatePicker id={id} value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />}
            </FormField>
            <FormField label={t('receipts.category')}>
              {(id) => <AppSelect id={id} value={form.category ?? ''} onChange={(v) => setForm({ ...form, category: v })}
                placeholder={t('categories.placeholder')} options={categoryOptions(RECEIPT_CATEGORIES, t)} />}
            </FormField>
          </FormSection>
          <FormSection title={t('receipts.currentImage')}>
            {receipt ? (
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-end gap-4">
                  {receipt.hasImage ? (
                    <ReceiptImage key={imageVersion} receiptId={receipt.id} alt={receipt.title} className="size-32 rounded-md"
                      onClick={(src) => setPreview({ src, title: receipt.title })} />
                  ) : (
                    <div className="flex size-32 flex-col items-center justify-center gap-1 rounded-md border border-line bg-band text-xs text-muted">
                      <Icon name="image" className="size-6" />{t('receipts.noImage')}
                    </div>
                  )}
                  <Button variant="secondary" icon="image" loading={updateImageMutation.isPending} onClick={() => imageInputRef.current?.click()}>
                    {t('receipts.changeImage')}
                  </Button>
                  <input ref={imageInputRef} type="file" accept={IMAGE_TYPES} className="hidden"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) updateImageMutation.mutate(file); e.target.value = ''; }} />
                </div>
              </div>
            ) : (
              <FormField label={t('receipts.image')} required error={fieldError('image')} className="md:col-span-2">
                {(id) => <input id={id} type="file" required accept={IMAGE_TYPES} onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />}
              </FormField>
            )}

            {uploadProgress !== null && <div className="md:col-span-2"><ProgressBar label={t('receipts.uploading')} percent={uploadProgress} /></div>}
          </FormSection>
        </div>
      </fieldset>
      <FormPageActions onCancel={backToList} saving={saving} dirty={dirty} onDelete={receipt ? () => deleteMutation.mutateAsync(receipt.id) : undefined} submitIcon={receipt ? 'check' : 'upload'}
        submitLabel={receipt ? t('common.saveChanges') : t('receipts.upload')} />
      <ImageLightbox image={preview} onClose={() => setPreview(null)} />
    </form>
  );
}
