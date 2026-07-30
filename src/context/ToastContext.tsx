import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (title: string, type: ToastType, description?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, type: ToastType, description?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto dismiss
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      
      {/* Toast container portal-like placement */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-[calc(100vw-32px)] sm:w-[380px] pointer-events-none text-left">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            let icon = 'info';
            let iconColor = 'text-primary dark:text-primary-fixed';
            
            if (toast.type === 'success') {
              icon = 'check_circle';
              iconColor = 'text-green-500';
            } else if (toast.type === 'warning') {
              icon = 'warning';
              iconColor = 'text-yellow-500';
            } else if (toast.type === 'error') {
              icon = 'error';
              iconColor = 'text-error';
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="pointer-events-auto bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-4 rounded-2xl shadow-xl flex gap-3 items-start overflow-hidden relative"
              >
                {/* Accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  toast.type === 'success' ? 'bg-green-500' :
                  toast.type === 'warning' ? 'bg-yellow-500' :
                  toast.type === 'error' ? 'bg-error' : 'bg-primary'
                }`} />

                <span className={`material-symbols-outlined ${iconColor} text-[22px] flex-shrink-0 mt-0.5`}>
                  {icon}
                </span>
                
                <div className="flex-grow pl-1">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface leading-tight">
                    {toast.title}
                  </h4>
                  {toast.description && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1 leading-snug">
                      {toast.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant/30 flex-shrink-0 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
