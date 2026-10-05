import Link from "next/link";
import { Plus } from "lucide-react";
import PlatformChip from "@/components/app/PlatformChip";
import { platformLabel } from "@/config/platformIcons";

function chipLabel(platform) {
  const base = platformLabel(platform.name);
  return platform.platformUsername && platform.name === "Facebook" ? platform.platformUsername : base;
}

export default function SendTo({ platforms, selected, onToggle, disabled }) {
  return (
    <section className="mt-7" aria-label="Send to">
      <div className="flex items-center gap-3 mb-3.5">
        <span className="cp-eyebrow">Send to</span>
        <span className="flex-1 h-px bg-cp-rule" />
        <span className="text-cp-accent text-xs font-bold tabular-nums">
          {selected.length}/{platforms.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <PlatformChip
            key={platform._id}
            name={platform.name}
            label={chipLabel(platform)}
            selected={selected.includes(platform.name)}
            onClick={() => onToggle(platform.name)}
            disabled={disabled}
          />
        ))}
        <Link
          href="/settings/accounts"
          className="cp-press inline-flex items-center gap-1.5 rounded-full border border-dashed border-cp-rule px-3.5 py-2 text-[13px] font-semibold text-cp-accent hover:border-cp-accent transition-colors"
        >
          <Plus size={14} />
          {platforms.length === 0 ? "Connect a platform" : "Add"}
        </Link>
      </div>
    </section>
  );
}
