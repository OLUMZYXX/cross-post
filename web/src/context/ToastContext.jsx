"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const TOAST_ICON_COLORS = {
  success: "text-cp-olive",
  error: "text-cp-accent",
  info: "text-cp-info",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = "info", title, duration = 3000 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-4 right-4 sm:left-auto z-[70] flex flex-col items-end gap-2 sm:max-w-sm" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type];
          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className="w-full sm:w-auto flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl border border-cp-rule bg-cp-card text-cp-ink shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)] animate-slide-in"
            >
              <Icon size={18} className={TOAST_ICON_COLORS[toast.type]} />
              <span className="text-sm font-semibold flex-1">{toast.title}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss"
                className="p-1 text-cp-soft hover:text-cp-ink transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
