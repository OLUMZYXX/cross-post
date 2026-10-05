"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, eyebrow, children, className = "" }) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="app fixed inset-0 z-[60] !bg-transparent flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative bg-cp-card border border-cp-rule rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-md max-h-[88vh] overflow-y-auto shadow-2xl animate-fade-in-up ${className}`}
      >
        <div className="sm:hidden mx-auto mt-2.5 h-1 w-10 rounded-full bg-cp-rule" />
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-2">
          <div>
            {eyebrow ? <p className="cp-eyebrow !text-cp-accent mb-1">{eyebrow}</p> : null}
            <h3 className="font-display text-cp-ink text-[22px] leading-tight font-semibold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-cp-muted hover:text-cp-ink hover:bg-cp-deep transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6 pt-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
