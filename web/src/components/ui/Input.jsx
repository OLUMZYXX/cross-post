"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({ label, type = "text", error, icon: Icon, className = "", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={className}>
      {label && (
        <label className="block text-neutral-400 text-xs font-medium mb-1.5">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
        )}
        <input
          type={inputType}
          className={`w-full bg-neutral-900 border rounded-xl px-3 py-2.5 text-white text-sm placeholder-neutral-600 outline-none transition-colors ${
            Icon ? "pl-9" : ""
          } ${isPassword ? "pr-9" : ""} ${
            error ? "border-red-500/50 focus:border-red-500" : "border-neutral-800 focus:border-neutral-600"
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
