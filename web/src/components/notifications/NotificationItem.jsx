import { Bell, CheckCircle2, XCircle, AlertCircle, Clock, Link2, Unlink, Trash2 } from "lucide-react";
import { timeAgo } from "@/utils/time";

const TYPES = {
  post_published: { icon: CheckCircle2, tone: "bg-cp-olive-soft text-cp-olive", label: "Published" },
  post_failed: { icon: XCircle, tone: "bg-cp-accent-soft text-cp-accent", label: "Failed" },
  post_partial: { icon: AlertCircle, tone: "bg-cp-accent-soft text-cp-accent", label: "Partly sent" },
  post_scheduled: { icon: Clock, tone: "bg-cp-info-soft text-cp-info", label: "Scheduled" },
  schedule_reminder: { icon: Bell, tone: "bg-cp-info-soft text-cp-info", label: "Reminder" },
  platform_connected: { icon: Link2, tone: "bg-cp-olive-soft text-cp-olive", label: "Connected" },
  platform_disconnected: { icon: Unlink, tone: "bg-cp-accent-soft text-cp-accent", label: "Disconnected" },
};

export default function NotificationItem({ item, onOpen, onDelete }) {
  const type = TYPES[item.type] || TYPES.post_published;

  return (
    <li
      className={`group flex items-start gap-1 rounded-3xl border transition-colors ${
        item.read ? "bg-cp-paper border-cp-rule-soft" : "bg-cp-card border-cp-rule"
      }`}
    >
      <button type="button" onClick={() => onOpen(item)} className="flex-1 min-w-0 flex items-start gap-3.5 p-4 text-left">
        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${type.tone}`}>
          <type.icon size={18} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2">
            <span className={`text-[15px] truncate ${item.read ? "text-cp-muted" : "text-cp-ink font-semibold"}`}>
              {item.title}
            </span>
            {!item.read ? <span className="w-2 h-2 rounded-full bg-cp-accent shrink-0" aria-label="Unread" /> : null}
          </span>
          <span className={`block text-sm mt-0.5 ${item.read ? "text-cp-soft" : "text-cp-muted"}`}>{item.message}</span>
          <span className="block text-xs text-cp-soft mt-1.5">
            {type.label} · {timeAgo(item.createdAt)}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(item._id)}
        aria-label="Delete notification"
        className="m-3 w-9 h-9 rounded-full flex items-center justify-center text-cp-soft hover:text-cp-accent hover:bg-cp-deep sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-all"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}
