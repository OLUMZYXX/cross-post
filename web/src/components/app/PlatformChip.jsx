import { Check } from "lucide-react";
import { platformIcon } from "@/config/platformIcons";

export default function PlatformChip({ name, label, selected = false, onClick, disabled = false }) {
  const Icon = platformIcon(name);
  const isButton = Boolean(onClick);
  const Tag = isButton ? "button" : "span";

  return (
    <Tag
      {...(isButton ? { type: "button", onClick, disabled, "aria-pressed": selected } : {})}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
        isButton ? "cp-press disabled:opacity-50" : ""
      } ${
        selected
          ? "bg-cp-ink border-cp-ink text-cp-card shadow-[0_2px_0_var(--cp-chip-shadow)]"
          : "bg-cp-card border-cp-rule text-cp-ink hover:border-cp-soft"
      }`}
    >
      <Icon size={14} />
      <span className="truncate max-w-[160px]">{label || name}</span>
      {selected ? <Check size={14} strokeWidth={2.5} /> : null}
    </Tag>
  );
}
