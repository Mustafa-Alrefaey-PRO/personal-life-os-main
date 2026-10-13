import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from './Icon';
import { ToastContext, type ToastType } from './useToast';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const SHOW_MS = 3500;

const tones: Record<ToastType, { box: string; icon: IconName }> = {
  success: { box: 'border-s-success bg-success-soft text-success', icon: 'check' },
  error: { box: 'border-s-danger-text bg-danger-soft text-danger-text', icon: 'alert' },
  info: { box: 'border-s-info bg-info-soft text-info', icon: 'info' },
};

/**
 * Wide tinted banner with a solid bar on the leading edge and the message
 * centred with its icon. Slides down into place, stays 3.5s, then leaves at
 * once; clicking it dismisses it early.
 */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const { t } = useTranslation();
  const { box, icon } = tones[toast.type];

  useEffect(() => {
    const remove = setTimeout(() => onRemove(toast.id), SHOW_MS);
    return () => clearTimeout(remove);
  }, [toast.id, onRemove]);

  return (
    // Opaque surface underneath so the semi-transparent dark-mode tints stay solid
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      title={t('common.close')}
      onClick={() => onRemove(toast.id)}
      className="animate-toast-in cursor-pointer rounded bg-surface shadow-pop"
    >
      <div className={`flex min-h-15 items-center justify-center gap-2.5 rounded border-s-4 px-6 py-3 ${box}`}>
        <p className="text-center text-sm font-bold">{toast.message}</p>
        <Icon name={icon} className="size-[18px] shrink-0" />
      </div>
    </div>
  );
}

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
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
