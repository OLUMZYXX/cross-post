import { CalendarDays } from "lucide-react";
import EmptyState from "@/components/app/EmptyState";
import { DayPost } from "@/components/calendar/DailyReview";
import { postDateOf } from "@/utils/calendarHelpers";

function groupByDay(posts) {
  const groups = new Map();
  posts.forEach((post) => {
    const date = postDateOf(post);
    const key = date.toDateString();
    if (!groups.has(key)) groups.set(key, { date, posts: [] });
    groups.get(key).posts.push(post);
  });
  return [...groups.values()];
}

export default function AgendaList({ posts }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-3xl bg-cp-card border border-cp-rule">
        <EmptyState
          icon={CalendarDays}
          title="A quiet month"
          body="Nothing sent or scheduled this month yet."
          actionLabel="Schedule a post"
          actionHref="/create"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupByDay(posts).map((group) => (
        <section key={group.date.toDateString()} className="grid sm:grid-cols-[120px_1fr] gap-3 sm:gap-6">
          <div>
            <p className="cp-eyebrow !text-cp-accent">{group.date.toLocaleDateString(undefined, { weekday: "short" })}</p>
            <p className="font-display text-cp-ink text-3xl font-semibold leading-none mt-1">{group.date.getDate()}</p>
          </div>
          <div className="space-y-2.5">
            {group.posts.map((post) => (
              <DayPost key={post._id} post={post} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
