import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from './Alert';
import { ToastContext, type ToastType } from './useToast';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const SHOW_MS = 3200;
const EXIT_MS = 300;

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => setVisible(false), SHOW_MS);
    const remove = setTimeout(() => onRemove(toast.id), SHOW_MS + EXIT_MS);
    return () => { cancelAnimationFrame(show); clearTimeout(hide); clearTimeout(remove); };
  }, [toast.id, onRemove]);

  return (
    <div className={`transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}>
      <Alert
        variant={toast.type}
        message={toast.message}
        onClose={() => onRemove(toast.id)}
        closeLabel={t('common.close')}
       
      />
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
      <div
        className="pointer-events-none fixed top-4 left-1/2 z-[100] flex w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
