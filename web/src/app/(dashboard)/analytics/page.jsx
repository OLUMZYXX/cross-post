"use client";

import { useMemo } from "react";
import {
  Send,
  TrendingUp,
  Calendar,
  Globe,
  CheckCircle,
  XCircle,
  Image,
  FileText,
} from "lucide-react";
import usePostsData from "@/hooks/usePostsData";
import {
  computeOverviewStats,
  computeWeeklyActivity,
  computePlatformStats,
  computeSuccessFailure,
  computeMediaStats,
} from "@/utils/analytics";
import { PLATFORM_CONFIG } from "@/config/platforms";
import Spinner from "@/components/ui/Spinner";

export default function AnalyticsPage() {
  const { allPosts, sentPosts, connectedNames, loading } = usePostsData();

  const overview = useMemo(
    () => computeOverviewStats(sentPosts, allPosts),
    [sentPosts, allPosts],
  );
  const weekly = useMemo(() => computeWeeklyActivity(sentPosts), [sentPosts]);
  const platformStats = useMemo(
    () => computePlatformStats(sentPosts),
    [sentPosts],
  );
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
      <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white font-headline mb-4 sm:mb-5">
        Analytics
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-neutral-500 text-[9px] sm:text-[11px] uppercase tracking-wide">
                {s.label}
              </span>
              <s.icon size={12} className="text-neutral-600 sm:hidden" />
              <s.icon size={14} className="text-neutral-600 hidden sm:block" />
            </div>
            <p className="text-base sm:text-xl font-semibold text-white">
              {s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {sf.total > 0 && (
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <h3 className="text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Success Rate
            </h3>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative w-18 h-18 sm:w-24 sm:h-24">
                <svg viewBox="0 0 36 36" className="w-18 h-18 sm:w-24 sm:h-24 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#262626"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray={`${sf.successRate * 0.974} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm sm:text-lg">
                    {sf.successRate}%
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle size={11} className="text-green-400 sm:hidden" />
                  <CheckCircle size={13} className="text-green-400 hidden sm:block" />
                  <span className="text-neutral-400 text-[10px] sm:text-xs">
                    {sf.totalSuccess} succeeded
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <XCircle size={11} className="text-red-400 sm:hidden" />
                  <XCircle size={13} className="text-red-400 hidden sm:block" />
                  <span className="text-neutral-400 text-[10px] sm:text-xs">
                    {sf.totalFailed} failed
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5">
          <h3 className="text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Weekly Activity
          </h3>
          <div className="flex items-end gap-1.5 sm:gap-2 h-20 sm:h-28">
            {weekly.days.map((day) => (
              <div
                key={day.label}
                className="flex-1 min-w-0 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-white/[0.04] rounded-sm overflow-hidden h-[56px] sm:h-[80px]"
                >
                  <div
                    className="w-full bg-green-500 rounded-sm mt-auto"
                    style={{
                      height: `${(day.count / weekly.maxCount) * 100}%`,
                      marginTop: `${100 - (day.count / weekly.maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-neutral-600 text-[8px] sm:text-[10px]">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {platformStats.length > 0 && (
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <h3 className="text-white text-xs sm:text-sm font-medium mb-2.5 sm:mb-3">
              Platform Breakdown
            </h3>
            <div className="space-y-2 sm:space-y-2.5">
              {platformStats.map((p) => {
                const config = PLATFORM_CONFIG[p.name.toLowerCase()] || {};
                return (
                  <div key={p.name} className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.color || "#666"}15` }}
                    >
                      <span
                        className="text-[9px] sm:text-[10px] font-medium"
                        style={{ color: config.color }}
                      >
                        {p.name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <span className="text-white text-[10px] sm:text-xs">
                          {config.label || p.name}
                        </span>
                        <span className="text-neutral-500 text-[9px] sm:text-[11px]">
                          {p.successRate}%
                        </span>
                      </div>
                      <div className="h-1 bg-white/[0.06] rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${p.successRate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-neutral-600 text-[10px] sm:text-[11px] w-6 sm:w-8 text-right flex-shrink-0">
                      {p.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sentPosts.length > 0 && (
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <h3 className="text-white text-xs sm:text-sm font-medium mb-2.5 sm:mb-3">
              Media Breakdown
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Image size={12} className="text-neutral-400 sm:hidden" />
                  <Image size={14} className="text-neutral-400 hidden sm:block" />
                  <span className="text-neutral-300 text-[10px] sm:text-xs">With media</span>
                </div>
                <span className="text-white text-xs sm:text-sm font-medium">
                  {media.withMedia}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <FileText size={12} className="text-neutral-400 sm:hidden" />
                  <FileText size={14} className="text-neutral-400 hidden sm:block" />
                  <span className="text-neutral-300 text-[10px] sm:text-xs">Text only</span>
                </div>
                <span className="text-white text-xs sm:text-sm font-medium">
                  {media.textOnly}
                </span>
              </div>
              <div className="h-1.5 sm:h-2 bg-white/[0.06] rounded-full overflow-hidden flex">
                {media.withMedia > 0 && (
                  <div
                    className="bg-green-500 h-full"
                    style={{
                      width: `${(media.withMedia / (media.withMedia + media.textOnly)) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
