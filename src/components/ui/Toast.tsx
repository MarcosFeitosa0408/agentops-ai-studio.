'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    // Auto remove after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[9999] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((msg) => (
          <ToastItem key={msg.id} message={msg} onClose={() => removeToast(msg.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast UI item
interface ToastItemProps {
  message: ToastMessage;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ message, onClose }) => {
  const { title, description, type = 'info' } = message;

  const iconMap = {
    success: <CheckCircle className="text-success h-5 w-5 shrink-0" />,
    warning: <AlertTriangle className="text-warning h-5 w-5 shrink-0" />,
    danger: <AlertCircle className="text-danger h-5 w-5 shrink-0" />,
    info: <Info className="text-primary h-5 w-5 shrink-0" />,
  };

  return (
    <div className="bg-surface border-border/80 text-text-primary animate-in slide-in-from-bottom-5 pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg duration-300 select-none">
      {iconMap[type]}
      <div className="flex flex-grow flex-col gap-0.5 pr-2">
        <h4 className="text-text-primary text-sm leading-tight font-semibold">{title}</h4>
        {description && <p className="text-text-secondary text-xs leading-normal">{description}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-text-muted hover:text-text-primary hover:bg-neutral-light cursor-pointer rounded-lg p-0.5 transition-colors"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
