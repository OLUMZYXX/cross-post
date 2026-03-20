"use client";

import { Settings as SettingsIcon, Clock } from "lucide-react";
import { PLATFORM_CONFIG } from "@/config/platforms";

export default function AccountCard({ platform, onDisconnect }) {
  const config = PLATFORM_CONFIG[platform.name.toLowerCase()] || {};
  const gradFrom = config.color || "#666";
  const gradTo = config.gradientTo || config.color || "#888";

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800/50 overflow-hidden group hover:border-neutral-700/50 transition-all">
      <div
        className="relative p-5 pb-4"
        style={{ background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)` }}
      >
        <div className="flex justify-between items-start mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white text-lg font-bold">{platform.name[0]}</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse-dot" />
            ACTIVE
          </span>
        </div>

        <h3 className="text-xl font-bold text-white font-headline">{config.label || platform.name}</h3>
        <p className="text-white/70 font-medium text-sm mt-0.5">
          @{platform.platformUsername || "connected"}
        </p>
      </div>

      <div className="px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <Clock size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Last Sync: Active</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-lg text-neutral-400 text-xs font-semibold hover:bg-neutral-800 hover:text-white transition-colors">
            Settings
          </button>
          <button
            onClick={() => onDisconnect(platform)}
            className="px-3 py-1.5 rounded-lg text-neutral-500 text-xs font-semibold hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
