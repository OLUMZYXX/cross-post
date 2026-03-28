"use client";

import { useMemo } from "react";
import {
  getMonthDays,
  getPostsForDate,
  isSameDay,
} from "@/utils/calendarHelpers";
import { PLATFORM_CONFIG } from "@/config/platforms";

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({
  currentYear,
  currentMonth,
  posts,
  selectedDate,
  onSelectDate,
  platformFilter,
}) {
  const days = useMemo(
    () => getMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const filteredPosts = useMemo(() => {
    if (!platformFilter || platformFilter === "all") return posts;
    return posts.filter((p) =>
      (p.platforms || []).some((plat) =>
        plat.toLowerCase().includes(platformFilter.toLowerCase()),
      ),
    );
  }, [posts, platformFilter]);

  return (
    <div>
      <div className="calendar-grid border-b border-white/[0.04] pb-2 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-[10px] font-extrabold uppercase tracking-widest ${
              i >= 5 ? "text-green-500/60" : "text-neutral-600"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid gap-px bg-white/[0.02] rounded-2xl overflow-hidden border border-white/[0.06]">
        {days.map((day, idx) => {
          const dayPosts = getPostsForDate(filteredPosts, day.date);
          const isSelected = selectedDate && isSameDay(day.date, selectedDate);
          const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day.date)}
              className={`p-2.5 min-h-[100px] cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-green-500/5 border-2 border-green-500/50 ring-2 ring-inset ring-[#0a0a0a] z-10 shadow-sm"
                  : "bg-white/[0.01] hover:bg-white/[0.03]"
              } ${!day.isCurrentMonth ? "opacity-30" : ""}`}
            >
              <span
                className={`text-xs font-bold ${
                  day.isToday
                    ? "text-green-400"
                    : isSelected
                      ? "text-green-400"
                      : isWeekend && day.isCurrentMonth
                        ? "text-green-500/60"
                        : "text-neutral-400"
                }`}
              >
                {day.date.getDate()}
              </span>

              {dayPosts.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {dayPosts.slice(0, 3).map((post) => {
                    const platformName = (post.platforms?.[0] || "")
                      .split(":")[0]
                      .toLowerCase();
                    const config = PLATFORM_CONFIG[platformName] || {};
                    return (
                      <div
                        key={post._id}
                        className="flex items-center gap-1 rounded-sm p-0.5 text-[9px]"
                        style={{
                          backgroundColor: `${config.color || "#666"}15`,
                          borderLeft: `2px solid ${config.color || "#666"}`,
                        }}
                      >
                        <span
                          className="truncate font-bold"
                          style={{ color: config.color || "#999" }}
                        >
                          {post.caption?.slice(0, 16) || "Post"}
                        </span>
                      </div>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <span className="text-[9px] text-neutral-500 font-medium">
                      +{dayPosts.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {dayPosts.length === 0 && day.isCurrentMonth && isSelected && (
                <div className="mt-2 h-10 bg-white/[0.03] rounded-lg flex items-center justify-center border border-dashed border-white/[0.06]">
                  <span className="text-neutral-600 text-[10px]">No posts</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
