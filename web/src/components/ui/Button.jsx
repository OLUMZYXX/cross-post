import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "cp-chunky bg-cp-ink text-cp-card [--chunky-shadow:#000]",
  accent: "cp-chunky bg-cp-accent text-white",
  green: "cp-chunky bg-cp-accent text-white",
  secondary: "bg-cp-card text-cp-ink border border-cp-rule hover:bg-cp-deep",
  danger: "bg-cp-accent-soft text-cp-accent hover:brightness-95",
  ghost: "text-cp-muted hover:text-cp-ink hover:bg-cp-deep",
};

const SIZES = {
  sm: "px-3.5 py-2 text-[13px] rounded-xl",
  md: "px-5 py-3 text-sm rounded-2xl",
  lg: "px-6 py-3.5 text-[15px] rounded-2xl",
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
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
