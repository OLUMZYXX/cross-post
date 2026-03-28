"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Send,
  TrendingUp,
  Calendar,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import usePostsData from "@/hooks/usePostsData";
import {
  computeOverviewStats,
  computeWeeklyActivity,
  computePlatformStats,
} from "@/utils/analytics";
import { PLATFORM_CONFIG } from "@/config/platforms";
import Spinner from "@/components/ui/Spinner";

export default function DashboardPage() {
  const { allPosts, sentPosts, platforms, connectedNames, loading } =
    usePostsData();
  const overview = useMemo(
    () => computeOverviewStats(sentPosts, allPosts),
    [sentPosts, allPosts],
  );
  const weekly = useMemo(() => computeWeeklyActivity(sentPosts), [sentPosts]);
  const platformStats = useMemo(
    () => computePlatformStats(sentPosts),
    [sentPosts],
  );

  if (loading) return <Spinner className="py-20" />;

  const recentPosts = sentPosts.slice(0, 5);
  const donutSize = 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const totalPlatformPosts = platformStats.reduce((sum, p) => sum + p.total, 0);

  let cumulativeOffset = 0;
  const donutSegments = platformStats.map((p) => {
    const config = PLATFORM_CONFIG[p.name.toLowerCase()] || {};
    const pct = totalPlatformPosts > 0 ? p.total / totalPlatformPosts : 0;
    const dashLen = pct * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += dashLen;
    return {
      ...p,
      color: config.color || "#666",
      dashLen,
      offset,
      label: config.label || p.name,
    };
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">
          Dashboard
        </h1>
        <p className="text-neutral-500 font-medium mt-1">
          Overview of your publishing activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Total Published
            </span>
            <Send size={16} className="text-neutral-600" />
          </div>
          <p className="text-3xl font-extrabold text-white font-headline">
            {sentPosts.length}
          </p>
          <p className="text-neutral-600 text-xs mt-1">
            Posts across all platforms
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              This Week
            </span>
            <TrendingUp size={16} className="text-neutral-600" />
          </div>
          <p className="text-3xl font-extrabold text-white font-headline">
            {overview.thisWeekCount}
          </p>
          <p className="text-neutral-600 text-xs mt-1">Published this week</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 shadow-lg shadow-green-500/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">
              Scheduled
            </span>
            <Calendar size={16} className="text-black/40" />
          </div>
          <p className="text-3xl font-extrabold text-black font-headline">
            {overview.scheduledCount}
          </p>
          <p className="text-black/60 text-xs mt-1">Queued for publishing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">
            Weekly Activity
          </p>
          <div className="flex items-end gap-2 h-32">
            {weekly.days.map((day) => (
              <div
                key={day.label}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-full bg-white/[0.04] rounded-lg overflow-hidden"
                  style={{ height: "96px" }}
                >
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-lg"
                    style={{
                      height: `${weekly.maxCount > 0 ? (day.count / weekly.maxCount) * 100 : 0}%`,
                      marginTop: `${weekly.maxCount > 0 ? 100 - (day.count / weekly.maxCount) * 100 : 100}%`,
                    }}
                  />
                </div>
                <span className="text-neutral-600 text-[10px] font-medium">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">
            Platform Split
          </p>
          {totalPlatformPosts === 0 ? (
            <p className="text-neutral-600 text-sm text-center py-8">
              No platform data yet
            </p>
          ) : (
            <div className="flex items-center gap-6">
              <svg
                viewBox={`0 0 ${donutSize} ${donutSize}`}
                className="w-28 h-28 -rotate-90 flex-shrink-0"
              >
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.name}
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="8"
                    strokeDasharray={`${seg.dashLen} ${circumference - seg.dashLen}`}
                    strokeDashoffset={-seg.offset}
                  />
                ))}
              </svg>
              <div className="flex-1 space-y-2">
                {donutSegments.slice(0, 5).map((seg) => (
                  <div key={seg.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-neutral-400 text-xs flex-1 truncate">
                      {seg.label}
                    </span>
                    <span className="text-white text-xs font-semibold">
                      {seg.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Recent Activity
          </p>
          <Link
            href="/posts"
            className="text-neutral-500 hover:text-green-400 text-xs flex items-center gap-1 transition-colors duration-200"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-neutral-600 text-sm py-6 text-center">
            No posts yet. Create your first post!
          </p>
        ) : (
          <div className="space-y-1">
            {recentPosts.map((post) => {
              const succeeded = (post.publishResults || []).filter(
                (r) => r.success,
              ).length;
              const failed = (post.publishResults || []).filter(
                (r) => !r.success,
              ).length;
              return (
                <div
                  key={post._id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {post.caption || "No caption"}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {succeeded > 0 && (
                        <span className="flex items-center gap-1 text-green-400 text-[11px]">
                          <CheckCircle size={11} /> {succeeded} sent
                        </span>
                      )}
                      {failed > 0 && (
                        <span className="flex items-center gap-1 text-red-400 text-[11px]">
                          <XCircle size={11} /> {failed} failed
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-neutral-600 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
