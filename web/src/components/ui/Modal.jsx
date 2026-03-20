"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, className = "" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-fade-in ${className}`}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h3 className="text-white font-medium text-sm">{title}</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
