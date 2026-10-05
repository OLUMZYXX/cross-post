"use client";

import { useMemo, useState } from "react";
import { getPostsForDate, postDateOf } from "@/utils/calendarHelpers";

export default function useCalendarMonth(allPosts) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);
  const [platformFilter, setPlatformFilter] = useState("all");

  const posts = useMemo(() => {
    const visible = allPosts.filter((post) => post.status === "scheduled" || post.status === "published");
    if (platformFilter === "all") return visible;
    return visible.filter((post) =>
      (post.platforms || []).some((name) => name.split(":")[0].toLowerCase() === platformFilter),
    );
  }, [allPosts, platformFilter]);

  const monthPosts = useMemo(
    () =>
      posts
        .filter((post) => {
          const date = postDateOf(post);
          return date && date.getMonth() === month && date.getFullYear() === year;
        })
        .sort((a, b) => postDateOf(a) - postDateOf(b)),
    [posts, month, year],
  );

  const selectedPosts = useMemo(() => getPostsForDate(posts, selectedDate), [posts, selectedDate]);

  const shiftMonth = (delta) => {
    const next = new Date(year, month + delta, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  };

  const goToToday = () => {
    setMonth(today.getMonth());
    setYear(today.getFullYear());
    setSelectedDate(today);
  };

  return {
    month,
    year,
    posts,
    monthPosts,
    selectedDate,
    selectedPosts,
    platformFilter,
    setSelectedDate,
    setPlatformFilter,
    previousMonth: () => shiftMonth(-1),
    nextMonth: () => shiftMonth(1),
    goToToday,
  };
}
