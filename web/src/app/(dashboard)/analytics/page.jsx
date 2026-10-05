"use client";

import { Send, TrendingUp, Clock, Layers } from "lucide-react";
import usePostsData from "@/hooks/usePostsData";
import useAnalytics from "@/hooks/useAnalytics";
import PageHeader from "@/components/app/PageHeader";
import StatCard from "@/components/app/StatCard";
import SuccessRing from "@/components/analytics/SuccessRing";
import WeeklyBars from "@/components/analytics/WeeklyBars";
import PlatformBreakdown from "@/components/analytics/PlatformBreakdown";
import MediaSplit from "@/components/analytics/MediaSplit";
import Spinner from "@/components/ui/Spinner";

function growthHint(percent) {
  if (percent === 0) return "Same as last week";
  return `${percent > 0 ? "+" : ""}${percent}% vs last week`;
}

export default function AnalyticsPage() {
  const { allPosts, sentPosts, loading } = usePostsData();
  const { overview, weekly, platforms, outcomes, media } = useAnalytics(sentPosts, allPosts);

  if (loading) return <Spinner className="py-24" />;

  return (
    <div className="animate-fade-in">
      <PageHeader eyebrow="Your numbers" title="Stats" subtitle="How your posts are landing across every platform." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Send} tone="accent" label="Published" value={sentPosts.length} />
        <StatCard icon={TrendingUp} tone="olive" label="This week" value={overview.thisWeekCount} hint={growthHint(overview.growthPercent)} />
        <StatCard icon={Clock} tone="info" label="Scheduled" value={overview.scheduledCount} />
        <StatCard icon={Layers} tone="accent" label="Deliveries" value={overview.totalReach} hint="Posts × platforms" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-4 mt-4">
        <WeeklyBars weekly={weekly} />
        <SuccessRing outcomes={outcomes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-4 mt-4">
        <PlatformBreakdown platforms={platforms} />
        <MediaSplit media={media} />
      </div>
    </div>
  );
}
