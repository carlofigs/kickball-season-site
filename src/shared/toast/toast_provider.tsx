import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ToastBanner } from './toast_banner';

const TOAST_VISIBLE_MS = 2_500;

export type UseToastResult = {
  /** Shows the toast with the given text; hides automatically after one second. */
  showToast: (text: string) => void;
};

const ToastContext = createContext<UseToastResult | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage == null) return;
    const id = window.setTimeout(() => setToastMessage(null), TOAST_VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [toastMessage]);

  function showToast(text: string) {
    setToastMessage(text);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastBanner message={toastMessage} />
    </ToastContext.Provider>
  );
}

export function useToast(): UseToastResult {
  const context = useContext(ToastContext);
  if (context == null) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
