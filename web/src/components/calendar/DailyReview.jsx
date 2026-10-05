import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { platformIcon } from "@/config/platformIcons";
import { postDateOf } from "@/utils/calendarHelpers";

const STATUS = {
  published: { label: "Sent", className: "bg-cp-olive-soft text-cp-olive" },
  scheduled: { label: "Scheduled", className: "bg-cp-info-soft text-cp-info" },
};

export function DayPost({ post }) {
  const status = STATUS[post.status] || STATUS.scheduled;
  const platforms = [...new Set((post.platforms || []).map((name) => name.split(":")[0]))];

  return (
    <div className="rounded-2xl border border-cp-rule bg-cp-paper p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-cp-ink text-sm font-semibold tabular-nums">
          {postDateOf(post)?.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
      </div>
      <div className="flex gap-3 mt-2.5">
        {post.media?.[0] ? (
          <img src={post.media[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
        ) : null}
        <p className="text-cp-ink text-sm leading-relaxed line-clamp-3">{post.caption || "No caption"}</p>
      </div>
      <div className="flex gap-2 mt-3 text-cp-muted">
        {platforms.map((name) => {
          const Icon = platformIcon(name);
          return <Icon key={name} size={14} aria-label={name} />;
        })}
      </div>
    </div>
  );
}

export default function DailyReview({ selectedDate, posts }) {
  return (
    <aside className="rounded-3xl bg-cp-card border border-cp-rule p-5">
      <p className="cp-eyebrow !text-cp-accent">
        {selectedDate?.toLocaleDateString(undefined, { weekday: "long" })}
      </p>
      <h3 className="font-display text-cp-ink text-2xl font-semibold mt-1">
        {selectedDate?.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
      </h3>

      <div className="mt-5 space-y-2.5">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays size={22} className="mx-auto text-cp-soft" />
            <p className="text-cp-muted text-sm mt-3">Nothing on this day yet.</p>
          </div>
        ) : (
          posts.map((post) => <DayPost key={post._id} post={post} />)
        )}
      </div>

      <Link
        href="/create"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-cp-rule py-3.5 text-sm font-semibold text-cp-accent hover:border-cp-accent hover:bg-cp-accent-soft/40 transition-colors"
      >
        <Plus size={16} /> Schedule a post
      </Link>
    </aside>
  );
}
