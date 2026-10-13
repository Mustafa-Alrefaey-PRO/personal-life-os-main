import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from './Icon';
import { ToastContext, type ToastOptions, type ToastType } from './useToast';

interface Toast extends ToastOptions {
  id: number;
  message: string;
  type: ToastType;
}

const SHOW_MS = 3500;

const tones: Record<ToastType, { box: string; icon: IconName }> = {
  success: { box: 'border-s-success bg-success-soft text-success', icon: 'check' },
  error: { box: 'border-s-danger-text bg-danger-soft text-danger-text', icon: 'alert' },
  info: { box: 'border-s-info bg-info-soft text-info', icon: 'info' },
  // Removals: not a "success" moment, so no green
  neutral: { box: 'border-s-primary-dark bg-band text-title', icon: 'trash' },
};

/**
 * Wide tinted banner with a solid bar on the leading edge and the message
 * centred with its icon. Slides down into place, stays 3.5s (or `duration`),
 * paused while the pointer is over it, then leaves at once. Errors stay until
 * closed, so a failure is never missed. Clicking the banner closes it.
 */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number, viaAction: boolean) => void }) {
  const { t } = useTranslation();
  const { box, icon } = tones[toast.type];
  const persistent = toast.type === 'error';
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration ?? SHOW_MS);

  // Counts down only while not hovered; resumes with the time that was left.
  useEffect(() => {
    if (persistent || paused) return;
    const started = Date.now();
    const timer = setTimeout(() => onRemove(toast.id, false), remaining.current);
    return () => { clearTimeout(timer); remaining.current -= Date.now() - started; };
  }, [paused, persistent, toast.id, onRemove]);

  return (
    // Opaque surface underneath so the semi-transparent dark-mode tints stay solid
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      title={t('common.close')}
      onClick={() => onRemove(toast.id, false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="animate-toast-in cursor-pointer rounded bg-surface shadow-pop"
    >
      <div className={`flex min-h-15 items-center gap-3 rounded border-s-4 px-6 py-3 ${box}`}>
        <span className="flex-1" />
        <p className="text-center text-sm font-bold">{toast.message}</p>
        <Icon name={icon} className="size-[18px] shrink-0" />
        <span className="flex flex-1 justify-end">
          {toast.action && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toast.action!.onClick(); onRemove(toast.id, true); }}
              className="rounded-md border border-current/40 px-3 py-1 text-sm font-bold transition-colors duration-150 hover:bg-surface"
            >
              {toast.action.label}
            </button>
          )}
          {persistent && (
            <button
              type="button"
              aria-label={t('common.close')}
              onClick={(e) => { e.stopPropagation(); onRemove(toast.id, false); }}
              className="inline-flex size-6 items-center justify-center rounded opacity-70 hover:opacity-100"
            >
              <Icon name="x" className="size-3.5" />
            </button>
          )}
        </span>
      </div>
    </div>
  );
}

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef(toasts);
  useEffect(() => { toastsRef.current = toasts; });

  const remove = useCallback((id: number, viaAction: boolean) => {
    const toast = toastsRef.current.find((t) => t.id === id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
    // onClose runs once, and never after the action (e.g. Undo cancels a pending delete)
    if (toast && !viaAction) toast.onClose?.();
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', options: ToastOptions = {}) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, ...options }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/*
        Just under the top bar and breadcrumb strip (64 + 40px). On app pages it starts
        at the content's leading edge (--content-start, set by MainLayout from the sidebar
        width) and spans three-quarters of the content; elsewhere it spans the screen.
      */}
      <div className="pointer-events-none fixed inset-x-4 top-[104px] z-[100] flex flex-col gap-2 md:inset-x-auto md:start-[calc(var(--content-start,0px)+1.5rem)] md:w-[calc((100vw-var(--content-start,0px))*0.75)]">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
