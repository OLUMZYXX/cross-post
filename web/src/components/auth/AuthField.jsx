"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthField({ label, type = "text", error, hint, ...props }) {
  const [revealed, setRevealed] = useState(false);
  const fieldId = useId();
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div>
      <label htmlFor={fieldId} className="block text-ink text-sm font-semibold mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={`w-full rounded-xl bg-white border px-4 py-3.5 text-ink text-[15px] placeholder:text-ink-muted/70 outline-none transition-[border-color,box-shadow] duration-200 ${
            isPassword ? "pr-12" : ""
          } ${
            error
              ? "border-[#c2412d] focus:shadow-[0_0_0_4px_rgba(194,65,45,0.12)]"
              : "border-line hover:border-ink/25 focus:border-leaf focus:shadow-[0_0_0_4px_rgba(21,115,71,0.12)]"
          }`}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-muted hover:text-ink transition-colors"
          >
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="text-[#b4432f] text-sm mt-1.5">
          {error}
        </p>
      ) : hint ? (
        <p className="text-ink-muted text-sm mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}
