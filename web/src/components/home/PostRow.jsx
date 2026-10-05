import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { platformIcon } from "@/config/platformIcons";

const STATUS = {
  published: { label: "Sent", icon: CheckCircle2, className: "text-cp-olive bg-cp-olive-soft" },
  scheduled: { label: "Scheduled", icon: Clock, className: "text-cp-info bg-cp-info-soft" },
  draft: { label: "Draft", icon: FileText, className: "text-cp-muted bg-cp-deep" },
  failed: { label: "Failed", icon: XCircle, className: "text-cp-accent bg-cp-accent-soft" },
};

export function postStatus(post) {
  const results = post.publishResults || [];
  if (post.status === "published" && results.length > 0 && results.every((result) => !result.success)) {
    return "failed";
  }
  return STATUS[post.status] ? post.status : "draft";
}

export function postDate(post) {
  const value = post.publishedAt || post.scheduledAt || post.createdAt;
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function PostRow({ post, trailing }) {
  const status = STATUS[postStatus(post)];
  const platforms = [...new Set((post.platforms || []).map((name) => name.split(":")[0]))];

  return (
    <div className="flex items-start gap-3.5 py-3.5">
      <span className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${status.className}`}>
        <status.icon size={17} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-cp-ink text-[15px] leading-snug line-clamp-2">
          {post.caption || <span className="text-cp-soft italic">No caption</span>}
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-cp-soft">
          {platforms.slice(0, 5).map((name) => {
            const Icon = platformIcon(name);
            return <Icon key={name} size={13} aria-label={name} />;
          })}
          <span className="text-xs">
            {status.label} · {postDate(post)}
          </span>
        </div>
      </div>
      {trailing}
    </div>
  );
}
