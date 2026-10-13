import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'neutral';

export interface ToastOptions {
  /** A button on the toast, e.g. Undo. Clicking it closes the toast WITHOUT calling onClose. */
  action?: { label: string; onClick: () => void };
  /** Called when the toast closes any other way: it expired or was clicked away. */
  onClose?: () => void;
  /** Milliseconds on screen (paused while hovered). Errors stay until closed. */
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

export const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}
