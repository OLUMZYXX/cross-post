"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({ label, type = "text", error, icon: Icon, className = "", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = useId();
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="block text-cp-ink text-[13px] font-semibold mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cp-soft">
            <Icon size={16} />
          </div>
        )}
        <input
          id={fieldId}
          type={inputType}
          aria-invalid={Boolean(error)}
          className={`w-full bg-cp-card border rounded-2xl px-4 py-3 text-cp-ink text-sm placeholder:text-cp-soft outline-none transition-[border-color,box-shadow] duration-200 ${
            Icon ? "pl-10" : ""
          } ${isPassword ? "pr-11" : ""} ${
            error
              ? "border-cp-accent focus:shadow-[0_0_0_4px_var(--cp-accent-soft)]"
              : "border-cp-rule hover:border-cp-soft focus:border-cp-ink focus:shadow-[0_0_0_4px_var(--cp-rule-soft)]"
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-cp-soft hover:text-cp-ink transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-cp-accent text-xs mt-1.5">{error}</p>}
    </div>
  );
}
