"use client";

import { useMemo } from "react";
import {
  computeOverviewStats,
  computeWeeklyActivity,
  computePlatformStats,
  computeSuccessFailure,
  computeMediaStats,
} from "@/utils/analytics";

export default function useAnalytics(sentPosts, allPosts) {
  return useMemo(
    () => ({
      overview: computeOverviewStats(sentPosts, allPosts),
      weekly: computeWeeklyActivity(sentPosts),
      platforms: computePlatformStats(sentPosts),
      outcomes: computeSuccessFailure(sentPosts),
      media: computeMediaStats(sentPosts),
    }),
    [sentPosts, allPosts],
  );
}
