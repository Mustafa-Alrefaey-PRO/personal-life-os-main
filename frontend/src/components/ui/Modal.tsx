import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  /** Use "alertdialog" for confirmations that interrupt the user. */
  role?: 'dialog' | 'alertdialog';
  /** While true (e.g. saving), the dialog can't be closed and its controls are disabled */
  busy?: boolean;
  /** Element to focus on open; defaults to the first focusable element. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** "prompt": compact pale-blue box with no header band; the title is shown as a bold question above the buttons */
  variant?: 'default' | 'prompt';
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, maxWidth = '520px', role = 'dialog', initialFocusRef, busy = false, variant = 'default' }: ModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Latest onClose/busy without re-running the open/close effect when the parent re-renders
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  useEffect(() => { onCloseRef.current = onClose; busyRef.current = busy; });

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    (initialFocusRef?.current ?? panel?.querySelector<HTMLElement>(FOCUSABLE))?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (!busyRef.current) onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !panel) return;
      // Keep Tab focus inside the dialog
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ maxWidth }}
        className={`brand-scroll relative max-h-[calc(100vh-2rem)] w-full animate-modal-in overflow-y-auto rounded-lg border shadow-pop ${
          variant === 'prompt' ? 'border-primary bg-table-head' : 'border-line bg-surface'
        }`}
      >
        {variant === 'prompt' ? (
          <h2 id={titleId} className="px-4 pt-4 text-sm font-bold text-title">{title}</h2>
        ) : (
          <div className="flex items-center justify-between border-b border-line bg-band px-5 py-3">
            <h2 id={titleId} className="text-base font-bold text-accent">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label={t('common.close')}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-heading"
            >
              <Icon name="x" />
            </button>
          </div>
        )}
        {/* A disabled fieldset disables every field and button inside while busy */}
        <fieldset disabled={busy} aria-busy={busy || undefined} className="min-w-0 p-5">{children}</fieldset>
      </div>
    </div>,
    document.body,
  );
}
