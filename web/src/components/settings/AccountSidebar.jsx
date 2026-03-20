"use client";

import { useMemo, useState } from "react";
import { Bell } from "lucide-react";

export default function AccountSidebar({ platforms, sentPosts }) {
  const stats = useMemo(() => {
    if (!sentPosts || sentPosts.length === 0) return { reliability: 0, bars: [0, 0, 0, 0, 0, 0, 0] };
    const results = sentPosts.flatMap((p) => p.publishResults || []);
    const total = results.length;
    const succeeded = results.filter((r) => r.success).length;
    const reliability = total > 0 ? Math.round((succeeded / total) * 100) : 0;
    const bars = Array.from({ length: 7 }, (_, i) => {
      const dayPosts = sentPosts.filter((p) => {
        const d = new Date(p.publishedAt);
        const daysAgo = Math.floor((Date.now() - d.getTime()) / 86400000);
        return daysAgo === (6 - i);
      });
      return dayPosts.length;
    });
    const maxBar = Math.max(...bars, 1);
    return { reliability, bars: bars.map((b) => (b / maxBar) * 100) };
  }, [sentPosts]);

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2 font-headline">
          <Bell size={18} className="text-green-400" />
          Hub Alerts
        </h3>
        <div className="space-y-5">
          <ToggleRow label="Post Success" desc="Alert settings for post success." defaultOn />
          <ToggleRow label="Post Failures" desc="Alert settings for post failures." defaultOn />
          <ToggleRow label="Platform News" desc="Alert settings for platform news." />
        </div>

        <div className="mt-6 pt-5 border-t border-neutral-800/30">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Notification Channel</p>
          <div className="flex gap-2">
            <ChannelPill label="EMAIL" active />
            <ChannelPill label="BROWSER" />
            <ChannelPill label="MOBILE" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-6 border border-neutral-800/50 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <span className="text-6xl">📊</span>
        </div>
        <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-1">Hub Health</p>
        <h4 className="text-2xl font-bold text-white mb-5 font-headline">{stats.reliability}% Reliable</h4>
        <div className="flex items-end gap-1.5 h-16 mb-5">
          {stats.bars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t transition-colors ${
                i === stats.bars.length - 1 ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]" : "bg-white/10 hover:bg-white/20"
              }`}
              style={{ height: `${Math.max(h, 5)}%` }}
            />
          ))}
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Your account connections have been stable. {platforms.length} platform{platforms.length !== 1 ? "s" : ""} connected and active.
        </p>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-neutral-500">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-10 h-5 rounded-full relative flex items-center px-0.5 cursor-pointer transition-colors ${
          on ? "bg-green-500" : "bg-neutral-700 hover:bg-neutral-600"
        }`}
      >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function ChannelPill({ label, active = false }) {
  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
      active
        ? "bg-green-500/10 text-green-400 border border-green-500/20"
        : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"
    }`}>
      {label}
    </span>
  );
}
