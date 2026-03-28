"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative glass bg-[#111111] border border-white/[0.06] rounded-xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-fade-in ${className}`}
      >
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-white/[0.06]">
          <h3 className="text-white font-semibold text-xs sm:text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors duration-200"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-3.5 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
