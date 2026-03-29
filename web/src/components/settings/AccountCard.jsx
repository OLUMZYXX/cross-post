"use client";

import { Clock } from "lucide-react";
import { PLATFORM_CONFIG } from "@/config/platforms";

export default function AccountCard({ platform, onDisconnect }) {
  const config = PLATFORM_CONFIG[platform.name.toLowerCase()] || {};
  const gradFrom = config.color || "#666";
  const gradTo = config.gradientTo || config.color || "#888";

  return (
    <div className="glass rounded-xl sm:rounded-2xl overflow-hidden group hover:border-white/[0.1] transition-all duration-200">
      <div
        className="relative p-3.5 sm:p-5 pb-3 sm:pb-4"
        style={{
          background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
        }}
      >
        <div className="flex justify-between items-start mb-5 sm:mb-8">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white text-base sm:text-lg font-bold">
              {platform.name[0]}
            </span>
          </div>
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[8px] sm:text-[10px] font-bold tracking-wider flex items-center gap-1 sm:gap-1.5">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-300 animate-pulse-dot" />
            ACTIVE
          </span>
        </div>

        <h3 className="text-base sm:text-xl font-bold text-white font-headline">
          {config.label || platform.name}
        </h3>
        <p className="text-white/70 font-medium text-xs sm:text-sm mt-0.5">
          @{platform.platformUsername || "connected"}
        </p>
      </div>

      <div className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-1.5 text-neutral-500">
          <Clock size={10} className="sm:hidden" />
          <Clock size={12} className="hidden sm:block" />
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
            Synced
          </span>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={() => onDisconnect(platform)}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-neutral-500 text-[10px] sm:text-xs font-semibold hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
