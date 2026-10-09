import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast } from '../components/ui/Toast';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (title: string, message?: string, variant?: ToastVariant) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, message?: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, variant }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => addToast(title, message, 'success'), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast(title, message, 'error'), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast(title, message, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            title={t.title}
            message={t.message}
            variant={t.variant}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
