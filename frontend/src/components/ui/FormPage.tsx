import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Card } from './Card';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { Modal } from './Modal';
import { Icon, type IconName } from './Icon';
import { Spinner } from './Spinner';

/**
 * Building blocks for full-page "new" and "details" forms:
 * titled sections holding a two-column field grid, the status bar, and the buttons underneath (incl. Delete).
 */

/** Bordered section with a gray header band and orange title; fields sit in two columns (one on phones). Use `md:col-span-2` for wide fields. */
export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      <h2 className="border-b border-line bg-band px-5 py-3 text-base font-bold text-accent">{title}</h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

interface FormPageActionsProps {
  onCancel: () => void;
  submitLabel: string;
  submitIcon?: IconName;
  saving: boolean;
  disabled?: boolean;
  /** Details pages: deletes the record; resolves when done (the page then navigates away) */
  onDelete?: () => Promise<unknown>;
  /** Ask before deleting. Off where the delete offers Undo instead (useUndoableDelete). */
  confirmDelete?: boolean;
  /** The form has unsaved edits: Cancel asks before leaving, and closing/reloading the tab warns */
  dirty?: boolean;
}

/** Delete (details pages only) + Cancel + submit under the form sections, aligned to the end. */
export function FormPageActions({ onCancel, submitLabel, submitIcon = 'check', saving, disabled, onDelete, confirmDelete = true, dirty = false }: FormPageActionsProps) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const stayRef = useRef<HTMLButtonElement>(null);

  // The browser's own "leave site?" prompt for tab close / reload while there are unsaved edits
  useEffect(() => {
    if (!dirty || saving) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);

  const deleteConfirmed = async () => {
    setDeleting(true);
    try {
      await onDelete?.();
    } catch {
      // The caller shows the error toast; just close the dialog
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-5 flex flex-wrap justify-end gap-3">
      {onDelete && (
        <Button variant="dangerOutline" icon="trash" onClick={() => (confirmDelete ? setConfirming(true) : void onDelete())} disabled={saving} className="min-w-36">{t('common.delete')}</Button>
      )}
      <Button variant="white" icon="xCircle" onClick={() => (dirty ? setLeaving(true) : onCancel())} disabled={saving} className="min-w-36">{t('common.cancel')}</Button>
      <Button type="submit" icon={submitIcon} loading={saving} disabled={disabled} className="min-w-36">{submitLabel}</Button>
      <Modal open={leaving} onClose={() => setLeaving(false)} title={t('common.leaveTitle')} role="alertdialog" variant="prompt" maxWidth="420px" initialFocusRef={stayRef}>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onCancel} className="min-w-36">{t('common.leaveConfirm')}</Button>
          <Button ref={stayRef} variant="white" onClick={() => setLeaving(false)} className="min-w-28">{t('common.leaveStay')}</Button>
        </div>
      </Modal>
      {onDelete && (
        <ConfirmDialog
          open={confirming}
          title={t('common.confirmDelete')}
          message={t('common.confirmDeleteMsg')}
          loading={deleting}
          onConfirm={deleteConfirmed}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

export type StatusTone = 'success' | 'warning' | 'danger' | 'info';

const toneFill: Record<StatusTone, string> = {
  success: 'bg-success hover:bg-success/90',
  warning: 'bg-warning hover:bg-warning/90',
  danger: 'bg-danger hover:bg-danger/90',
  info: 'bg-primary hover:bg-primary/90',
};
const toneDot: Record<StatusTone, string> = { success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-primary' };

interface StatusMenuProps {
  /** Current status label and color */
  label: string;
  tone: StatusTone;
  /** Possible changes: "action → resulting status" */
  options: { action: string; target: string; targetTone: StatusTone; onSelect: () => void }[];
  loading?: boolean;
  disabled?: boolean;
}

/** Filled status button colored by state; it opens a menu of the status changes available from here. */
export function StatusMenu({ label, tone, options, loading, disabled }: StatusMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled || loading}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('common.currentStatus')}
        className={`inline-flex h-10 min-w-44 items-center justify-between gap-4 rounded-md px-4 text-sm font-medium text-on-primary shadow-card transition-colors duration-150 disabled:opacity-70 ${toneFill[tone]}`}
      >
        {label}
        {loading ? <Spinner size="sm" className="border-current/30 border-t-current" />
          : <Icon name="chevronDown" className={`size-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && (
        <ul role="menu" className="absolute start-0 z-40 mt-1 min-w-full animate-modal-in overflow-hidden rounded-md border border-line bg-surface py-1 shadow-pop">
          {options.map((o) => (
            <li key={o.target} role="none">
              <button type="button" role="menuitem" onClick={() => { setOpen(false); o.onSelect(); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm whitespace-nowrap text-title transition-colors duration-150 hover:bg-hover">
                <span className="font-semibold">{o.action}</span>
                <Icon name="arrowRight" className="size-3.5 text-muted rtl:rotate-180" />
                <span className={`size-1.5 rounded-full ${toneDot[o.targetTone]}`} />
                <span className="text-muted">{o.target}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface DetailBarProps {
  /** Usually a <StatusMenu> */
  status?: React.ReactNode;
  /** Muted text after the status, e.g. the creation date */
  meta?: string;
}

/** Row above a details form: the record's status and when it was created. */
export function DetailBar({ status, meta }: DetailBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {status}
      {meta && <span className="text-sm text-muted">{meta}</span>}
    </div>
  );
}

/** Shown when a details URL points at a record that doesn't exist (or isn't the user's). */
export function RecordNotFound({ icon, backTo }: { icon: IconName; backTo: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Card>
      <EmptyState icon={icon} title={t('common.notFound')} hint={t('common.notFoundHint')}
        action={<Button variant="secondary" onClick={() => navigate(backTo)}>{t('common.backToList')}</Button>} />
    </Card>
  );
}
