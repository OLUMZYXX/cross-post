import Link from "next/link";
import { Clock } from "lucide-react";
import { platformIcon } from "@/config/platformIcons";
import { relativeDay } from "@/utils/posts";

export default function UpNext({ posts }) {
  if (posts.length === 0) return null;

  return (
    <section aria-label="Up next" className="mt-7">
      <div className="flex items-center justify-between mb-3">
        <p className="cp-eyebrow">Up next</p>
        <Link href="/calendar" className="text-cp-muted hover:text-cp-ink text-xs font-semibold transition-colors">
          Calendar
        </Link>
      </div>
      <div className="space-y-2">
        {posts.map((post) => (
          <div key={post._id} className="flex items-center gap-3.5 rounded-2xl bg-cp-info-soft/60 border border-cp-rule px-4 py-3">
            <Clock size={17} className="text-cp-info shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-cp-ink text-sm font-semibold truncate">{post.caption || "No caption"}</p>
              <p className="text-cp-muted text-xs mt-0.5">{relativeDay(post.scheduledAt)}</p>
            </div>
            <div className="flex -space-x-1">
              {[...new Set((post.platforms || []).map((name) => name.split(":")[0]))].slice(0, 3).map((name) => {
                const Icon = platformIcon(name);
                return (
                  <span key={name} className="w-6 h-6 rounded-full bg-cp-card border border-cp-rule flex items-center justify-center">
                    <Icon size={11} className="text-cp-ink" />
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
