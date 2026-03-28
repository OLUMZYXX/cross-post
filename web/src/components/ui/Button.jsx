import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/5",
  secondary:
    "bg-white/[0.06] text-neutral-300 hover:bg-white/[0.1] hover:text-white",
  danger:
    "bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/20",
  ghost: "text-neutral-400 hover:text-white hover:bg-white/[0.04]",
  green:
    "bg-gradient-to-r from-green-500 to-emerald-600 text-black hover:shadow-lg hover:shadow-green-500/20",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
