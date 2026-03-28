"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  type = "text",
  error,
  icon: Icon,
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={className}>
      {label && (
        <label className="block text-neutral-400 text-xs font-medium mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600"
          />
        )}
        <input
          type={inputType}
          className={`w-full bg-white/[0.03] border rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-neutral-600 outline-none transition-all duration-200 ${
            Icon ? "pl-10" : ""
          } ${isPassword ? "pr-10" : ""} ${
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-white/[0.06] focus:border-white/[0.15] focus:bg-white/[0.04]"
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
