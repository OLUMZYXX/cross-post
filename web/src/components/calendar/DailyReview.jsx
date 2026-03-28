"use client";

import Link from "next/link";
import { CalendarDays, Plus, Clock } from "lucide-react";
import { PLATFORM_CONFIG } from "@/config/platforms";

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDayLabel(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

const STATUS_STYLES = {
  published: "bg-green-500/10 text-green-400",
  scheduled: "bg-blue-500/10 text-blue-400",
  draft: "bg-neutral-800 text-neutral-400",
};

export default function DailyReview({ selectedDate, posts }) {
  const dayLabel = formatDayLabel(selectedDate);

  return (
    <div className="glass rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white font-headline">
            Daily Review
          </h3>
          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mt-0.5">
            {dayLabel}
          </p>
        </div>
        <span className="text-neutral-600 text-xs font-semibold">
          {posts.length} posts
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-10">
            <CalendarDays size={28} className="mx-auto text-neutral-700 mb-3" />
            <p className="text-neutral-500 text-sm font-medium">
              No posts scheduled
            </p>
            <p className="text-neutral-600 text-xs mt-1">
              Select a day with posts or schedule a new one
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const time = formatTime(post.scheduledAt || post.publishedAt);
            const platformName = (post.platforms?.[0] || "")
              .split(":")[0]
              .toLowerCase();
            const config = PLATFORM_CONFIG[platformName] || {};
            const statusStyle =
              STATUS_STYLES[post.status] || STATUS_STYLES.draft;

            return (
              <div
                key={post._id}
                className="bg-white/[0.03] hover:bg-white/[0.05] p-4 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                    {time}
                  </span>
                  <div className="flex gap-1">
                    {(post.platforms || []).slice(0, 3).map((plat) => {
                      const pName = plat.split(":")[0].toLowerCase();
                      const pConfig = PLATFORM_CONFIG[pName] || {};
                      return (
                        <div
                          key={plat}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ backgroundColor: pConfig.color || "#666" }}
                        >
                          {pName[0]?.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  {post.media?.[0] && (
                    <img
                      src={post.media[0]}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white line-clamp-1 mb-1">
                      {post.caption || "No caption"}
                    </p>
                    <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-2">
                      {post.caption?.slice(0, 100) || ""}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${statusStyle}`}
                  >
                    {post.status || "draft"}
                  </span>
                  {post.media?.length > 0 && (
                    <span className="text-[9px] text-neutral-600 font-medium">
                      {post.media.length} media
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        <Link
          href="/create"
          className="w-full py-4 border-2 border-dashed border-white/[0.06] rounded-xl text-neutral-500 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-200 flex flex-col items-center justify-center gap-1 group"
        >
          <Plus
            size={20}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Schedule New Slot
          </span>
        </Link>
      </div>
    </div>
  );
}
