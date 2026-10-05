"use client";

import usePostsData from "@/hooks/usePostsData";
import PageHeader from "@/components/app/PageHeader";
import Composer from "@/components/compose/Composer";
import PreviewStats from "@/components/home/PreviewStats";
import LatestActivity from "@/components/home/LatestActivity";
import Spinner from "@/components/ui/Spinner";
import UpNext from "@/components/home/UpNext";
import { latestPosts, upcomingPosts } from "@/utils/posts";

const LATEST_LIMIT = 5;
const UPCOMING_LIMIT = 2;

export default function DashboardPage() {
  const { allPosts, sentPosts, scheduledPosts, platforms, connectedNames, loading, refresh } = usePostsData();

  if (loading) return <Spinner className="py-24" />;

  const latest = latestPosts(allPosts, LATEST_LIMIT);
  const upcoming = upcomingPosts(allPosts, UPCOMING_LIMIT);

  return (
    <div className="animate-fade-in">
      <PageHeader eyebrow="Compose once" title="What's worth sharing today?" />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
        <Composer platforms={platforms} connectedNames={connectedNames} onDone={refresh} />

        <div>
          <PreviewStats
            sent={sentPosts.length}
            scheduled={scheduledPosts.length}
            platforms={new Set(connectedNames.map((name) => name.split(":")[0])).size}
          />
          <UpNext posts={upcoming} />
          <LatestActivity posts={latest} />
        </div>
      </div>
    </div>
  );
}
