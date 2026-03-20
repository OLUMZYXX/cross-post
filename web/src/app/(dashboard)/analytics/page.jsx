"use client";

import { useMemo } from "react";
import { Send, TrendingUp, Calendar, Globe, CheckCircle, XCircle, Image, FileText } from "lucide-react";
import usePostsData from "@/hooks/usePostsData";
import { computeOverviewStats, computeWeeklyActivity, computePlatformStats, computeSuccessFailure, computeMediaStats } from "@/utils/analytics";
import { PLATFORM_CONFIG } from "@/config/platforms";
import Spinner from "@/components/ui/Spinner";

export default function AnalyticsPage() {
  const { allPosts, sentPosts, connectedNames, loading } = usePostsData();

  const overview = useMemo(() => computeOverviewStats(sentPosts, allPosts), [sentPosts, allPosts]);
  const weekly = useMemo(() => computeWeeklyActivity(sentPosts), [sentPosts]);
  const platformStats = useMemo(() => computePlatformStats(sentPosts), [sentPosts]);
  const sf = useMemo(() => computeSuccessFailure(sentPosts), [sentPosts]);
  const media = useMemo(() => computeMediaStats(sentPosts), [sentPosts]);

  if (loading) return <Spinner className="py-20" />;

  const stats = [
    { label: "Total Reach", value: overview.totalReach, icon: Globe },
    { label: "Published", value: sentPosts.length, icon: Send },
    { label: "This Week", value: overview.thisWeekCount, icon: TrendingUp },
    { label: "Scheduled", value: overview.scheduledCount, icon: Calendar },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline mb-5">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-500 text-[11px] uppercase tracking-wide">{s.label}</span>
              <s.icon size={14} className="text-neutral-600" />
            </div>
            <p className="text-xl font-semibold text-white">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {sf.total > 0 && (
          <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-5">
            <h3 className="text-white text-sm font-medium mb-4">Success Rate</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#262626" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none" stroke="#22c55e" strokeWidth="3"
                    strokeDasharray={`${sf.successRate * 0.974} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{sf.successRate}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-green-400" />
                  <span className="text-neutral-400 text-xs">{sf.totalSuccess} succeeded</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle size={13} className="text-red-400" />
                  <span className="text-neutral-400 text-xs">{sf.totalFailed} failed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-5">
          <h3 className="text-white text-sm font-medium mb-4">Weekly Activity</h3>
          <div className="flex items-end gap-2 h-28">
            {weekly.days.map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-neutral-800 rounded-sm overflow-hidden" style={{ height: "80px" }}>
                  <div
                    className="w-full bg-green-500 rounded-sm mt-auto"
                    style={{ height: `${(day.count / weekly.maxCount) * 100}%`, marginTop: `${100 - (day.count / weekly.maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-neutral-600 text-[10px]">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {platformStats.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-5">
            <h3 className="text-white text-sm font-medium mb-3">Platform Breakdown</h3>
            <div className="space-y-2.5">
              {platformStats.map((p) => {
                const config = PLATFORM_CONFIG[p.name.toLowerCase()] || {};
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${config.color || "#666"}15` }}>
                      <span className="text-[10px] font-medium" style={{ color: config.color }}>{p.name[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs">{config.label || p.name}</span>
                        <span className="text-neutral-500 text-[11px]">{p.successRate}%</span>
                      </div>
                      <div className="h-1 bg-neutral-800 rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${p.successRate}%` }} />
                      </div>
                    </div>
                    <span className="text-neutral-600 text-[11px] w-8 text-right">{p.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sentPosts.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-5">
            <h3 className="text-white text-sm font-medium mb-3">Media Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image size={14} className="text-neutral-400" />
                  <span className="text-neutral-300 text-xs">With media</span>
                </div>
                <span className="text-white text-sm font-medium">{media.withMedia}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-neutral-400" />
                  <span className="text-neutral-300 text-xs">Text only</span>
                </div>
                <span className="text-white text-sm font-medium">{media.textOnly}</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden flex">
                {media.withMedia > 0 && (
                  <div className="bg-green-500 h-full" style={{ width: `${(media.withMedia / (media.withMedia + media.textOnly)) * 100}%` }} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
