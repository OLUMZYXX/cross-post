import { ArrowRight, Loader2 } from "lucide-react";
import { platformIcon } from "@/config/platformIcons";

export default function AddPlatformList({ platforms, connecting, onSelect }) {
  return (
    <div className="rounded-3xl bg-cp-card border border-cp-rule p-2.5 space-y-1.5">
      {platforms.map((platform) => {
        const Icon = platformIcon(platform.name);
        const busy = connecting === platform.name;
        return (
          <button
            key={platform.name}
            type="button"
            onClick={() => onSelect(platform)}
            disabled={Boolean(connecting)}
            className="cp-press w-full flex items-center gap-3.5 rounded-2xl border border-cp-rule bg-cp-paper px-4 py-3 text-left hover:bg-cp-deep disabled:opacity-60 transition-colors"
          >
            <span className="w-9 h-9 rounded-xl bg-cp-card border border-cp-rule flex items-center justify-center">
              <Icon size={17} className="text-cp-ink" />
            </span>
            <span className="flex-1 text-cp-ink text-[15px] font-semibold">
              {platform.label}
              {platform.isConnected ? <span className="ml-2 text-cp-muted text-xs font-medium">Add another</span> : null}
            </span>
            {busy ? (
              <Loader2 size={17} className="animate-spin text-cp-accent" />
            ) : (
              <ArrowRight size={17} className="text-cp-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
