import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-white text-black hover:bg-neutral-200",
  secondary: "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
  danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
  ghost: "text-neutral-400 hover:text-white hover:bg-neutral-800",
  green: "bg-green-500 text-black hover:bg-green-600",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export default function Button({ children, variant = "primary", size = "md", loading = false, disabled = false, className = "", ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
