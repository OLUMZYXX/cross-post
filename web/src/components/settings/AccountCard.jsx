"use client";

import { useEffect, useState } from "react";
import { platformIcon, platformLabel } from "@/config/platformIcons";

export default function AccountCard({ platform, onDisconnect }) {
  const [armed, setArmed] = useState(false);
  const Icon = platformIcon(platform.name);

  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <span className="w-11 h-11 rounded-2xl bg-cp-ink text-cp-card flex items-center justify-center shrink-0">
        <Icon size={19} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-cp-ink text-[15px] font-semibold truncate">{platformLabel(platform.name)}</p>
        <p className="text-cp-muted text-[13px] truncate">{platform.platformUsername || "Connected"}</p>
      </div>
      <button
        type="button"
        onClick={() => (armed ? onDisconnect(platform) : setArmed(true))}
        className={`cp-press rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
          armed ? "bg-cp-accent text-white" : "border border-cp-rule text-cp-muted hover:text-cp-accent"
        }`}
      >
        {armed ? "Confirm" : "Disconnect"}
      </button>
    </div>
  );
}
