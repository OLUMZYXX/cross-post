"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const TOAST_COLORS = {
  success: "bg-neutral-900 border-neutral-800 text-green-400",
  error: "bg-neutral-900 border-neutral-800 text-red-400",
  info: "bg-neutral-900 border-neutral-800 text-blue-400",
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
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type];
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm animate-slide-in ${TOAST_COLORS[toast.type]}`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium flex-1">{toast.title}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="opacity-60 hover:opacity-100 transition-opacity"
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
