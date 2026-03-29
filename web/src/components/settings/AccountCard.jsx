"use client";

import { Unlink } from "lucide-react";
import { PLATFORM_CONFIG } from "@/config/platforms";

export default function AccountCard({ platform, onDisconnect }) {
  const config = PLATFORM_CONFIG[platform.name.toLowerCase()] || {};
  const color = config.color || "#666";

  return (
    <div className="group relative bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <span className="text-base sm:text-lg font-bold" style={{ color }}>
            {platform.name[0]}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-semibold text-white truncate">
              {config.label || platform.name}
            </p>
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-500 truncate">
            @{platform.platformUsername || "connected"}
          </p>
        </div>

        <button
          onClick={() => onDisconnect(platform)}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-neutral-600 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 flex-shrink-0"
        >
          <Unlink size={13} className="sm:hidden" />
          <Unlink size={14} className="hidden sm:block" />
        </button>
      </div>
    </div>
  );
}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
