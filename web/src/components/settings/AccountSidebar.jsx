"use client";

import { useMemo } from "react";
import { Zap, TrendingUp, Activity } from "lucide-react";
import { PLATFORM_CONFIG } from "@/config/platforms";

export default function AccountSidebar({ platforms, sentPosts }) {
  const stats = useMemo(() => {
    if (!sentPosts || sentPosts.length === 0)
      return { reliability: 0, totalPosts: 0, bars: [0, 0, 0, 0, 0, 0, 0] };
    const results = sentPosts.flatMap((p) => p.publishResults || []);
    const total = results.length;
    const succeeded = results.filter((r) => r.success).length;
    const reliability = total > 0 ? Math.round((succeeded / total) * 100) : 0;
    const bars = Array.from({ length: 7 }, (_, i) => {
      const dayPosts = sentPosts.filter((p) => {
        const d = new Date(p.publishedAt);
        const daysAgo = Math.floor((Date.now() - d.getTime()) / 86400000);
        return daysAgo === 6 - i;
      });
      return dayPosts.length;
    });
    const maxBar = Math.max(...bars, 1);
    return {
      reliability,
      totalPosts: sentPosts.length,
      bars: bars.map((b) => (b / maxBar) * 100),
    };
  }, [sentPosts]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatBox
          icon={Zap}
          value={platforms.length}
          label="Linked"
          color="green"
        />
        <StatBox
          icon={TrendingUp}
          value={stats.totalPosts}
          label="Posts"
          color="blue"
        />
        <StatBox
          icon={Activity}
          value={`${stats.reliability}%`}
          label="Uptime"
          color="emerald"
        />
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <p className="text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            7-Day Activity
          </p>
          <p className="text-[10px] sm:text-xs text-green-400 font-semibold">
            {stats.reliability}%
          </p>
        </div>
        <div className="flex items-end gap-1 sm:gap-1.5 h-14 sm:h-20">
          {stats.bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded transition-all duration-300 ${
                  i === stats.bars.length - 1
                    ? "bg-green-500"
                    : "bg-white/[0.08] group-hover:bg-white/[0.12]"
                }`}
                style={{ height: `${Math.max(h, 8)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 sm:mt-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span
              key={i}
              className="text-[8px] sm:text-[9px] text-neutral-600 flex-1 text-center"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 sm:mb-3">
          Platforms
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {platforms.map((p) => {
            const cfg = PLATFORM_CONFIG[p.name.toLowerCase()] || {};
            return (
              <span
                key={p._id}
                className="px-2 sm:px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold border border-white/[0.06]"
                style={{
                  color: cfg.color,
                  backgroundColor: `${cfg.color}10`,
                }}
              >
                {cfg.label || p.name}
              </span>
            );
          })}
          {platforms.length === 0 && (
            <p className="text-[10px] sm:text-xs text-neutral-600">
              No platforms connected yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, value, label, color }) {
  const colorMap = {
    green: "text-green-400 bg-green-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
  };
  const classes = colorMap[color] || colorMap.green;

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5 sm:p-3.5 text-center">
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${classes} flex items-center justify-center mx-auto mb-1.5 sm:mb-2`}
      >
        <Icon size={13} className="sm:hidden" />
        <Icon size={15} className="hidden sm:block" />
      </div>
      <p className="text-sm sm:text-lg font-bold text-white">{value}</p>
      <p className="text-[9px] sm:text-[10px] text-neutral-500 font-medium">
        {label}
      </p>
    </div>
  );
}
