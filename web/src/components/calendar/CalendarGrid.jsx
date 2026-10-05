"use client";

import { useMemo } from "react";
import { getMonthDays, getPostsForDate, isSameDay } from "@/utils/calendarHelpers";

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_DOT = {
  published: "bg-cp-olive",
  scheduled: "bg-cp-info",
};

const STATUS_CHIP = {
  published: "bg-cp-olive-soft text-cp-olive",
  scheduled: "bg-cp-info-soft text-cp-info",
};

function DayCell({ day, posts, selected, onSelect }) {
  const label = day.date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <button
      type="button"
      onClick={() => onSelect(day.date)}
      aria-pressed={selected}
      aria-label={`${label}${posts.length ? `, ${posts.length} posts` : ""}`}
      className={`relative flex flex-col items-start justify-start text-left p-1.5 sm:p-2.5 min-h-[58px] sm:min-h-[104px] transition-colors ${
        selected ? "bg-cp-accent-soft/50" : "bg-cp-card hover:bg-cp-deep"
      } ${day.isCurrentMonth ? "" : "opacity-40"}`}
    >
      {selected ? <span className="absolute inset-0 ring-2 ring-inset ring-cp-accent pointer-events-none" /> : null}
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-semibold ${
          day.isToday ? "bg-cp-ink text-cp-card" : "text-cp-ink"
        }`}
      >
        {day.date.getDate()}
      </span>

      {posts.length > 0 ? (
        <>
          <div className="hidden sm:block w-full mt-1.5 space-y-1">
            {posts.slice(0, 2).map((post) => (
              <span
                key={post._id}
                className={`block truncate rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${STATUS_CHIP[post.status]}`}
              >
                {post.caption || "Post"}
              </span>
            ))}
            {posts.length > 2 ? (
              <span className="block text-[11px] text-cp-muted font-semibold px-1">+{posts.length - 2} more</span>
            ) : null}
          </div>
          <div className="sm:hidden flex gap-0.5 mt-1 px-1">
            {posts.slice(0, 3).map((post) => (
              <span key={post._id} className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[post.status]}`} />
            ))}
          </div>
        </>
      ) : null}
    </button>
  );
}

export default function CalendarGrid({ year, month, posts, selectedDate, onSelectDate }) {
  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  return (
    <div className="rounded-3xl border border-cp-rule overflow-hidden bg-cp-rule">
      <div className="grid grid-cols-7 bg-cp-paper">
        {DAY_HEADERS.map((label) => (
          <div key={label} className="py-2.5 text-center cp-eyebrow !text-[10px]">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {days.map((day) => (
          <DayCell
            key={day.date.toISOString()}
            day={day}
            posts={getPostsForDate(posts, day.date)}
            selected={selectedDate && isSameDay(day.date, selectedDate)}
            onSelect={onSelectDate}
          />
        ))}
      </div>
    </div>
  );
}
