import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message, confirmLabel, cancelLabel, loading = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  // Focus Cancel first so Enter never confirms a destructive action by accident
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal open={open} onClose={onCancel} title={title} role="alertdialog" initialFocusRef={cancelRef} maxWidth="440px" busy={loading}>
      <p className="mb-6 text-sm text-body">{message}</p>
      <div className="flex justify-end gap-2">
        <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel || t('common.cancel')}
        </Button>
        <Button variant="danger" icon="trash" onClick={onConfirm} loading={loading}>
          {confirmLabel || t('common.delete')}
        </Button>
      </div>
    </Modal>
  );
}
