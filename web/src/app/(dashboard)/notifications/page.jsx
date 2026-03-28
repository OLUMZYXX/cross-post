"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCheck,
  Trash2,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Link2,
  Unlink,
} from "lucide-react";
import { notificationAPI } from "@/services/notificationService";
import { useToast } from "@/context/ToastContext";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

const TYPE_CONFIG = {
  post_published: { icon: CheckCircle, color: "#22c55e", label: "Published" },
  post_failed: { icon: XCircle, color: "#ef4444", label: "Failed" },
  post_partial: { icon: AlertCircle, color: "#f59e0b", label: "Partial" },
  post_scheduled: { icon: Clock, color: "#3b82f6", label: "Scheduled" },
  schedule_reminder: { icon: Bell, color: "#a855f7", label: "Reminder" },
  platform_connected: { icon: Link2, color: "#22c55e", label: "Connected" },
  platform_disconnected: {
    icon: Unlink,
    color: "#ef4444",
    label: "Disconnected",
  },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetch_ = useCallback(async () => {
    try {
      const { data } = await notificationAPI.list();
      setNotifications(data.notifications || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast({ type: "success", title: "All marked as read" });
    } catch {
      showToast({ type: "error", title: "Failed" });
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
      showToast({ type: "success", title: "Cleared" });
    } catch {
      showToast({ type: "error", title: "Failed" });
    }
  };

  const handlePress = async (n) => {
    if (n.read) return;
    try {
      await notificationAPI.markAsRead(n._id);
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)),
      );
    } catch {}
  };

  const handleDelete = async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await notificationAPI.delete(id);
    } catch {}
  };

  if (loading) return <Spinner className="py-20" />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-green-400 text-[11px]">{unreadCount} unread</p>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck size={13} /> Read All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <Trash2 size={13} /> Clear
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <BellOff size={28} className="mx-auto text-neutral-700 mb-3" />
          <p className="text-neutral-500 text-sm">All caught up</p>
          <p className="text-neutral-600 text-xs mt-1">
            Notifications will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.post_published;
            const Icon = config.icon;
            return (
              <div
                key={n._id}
                onClick={() => handlePress(n)}
                className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 group ${
                  n.read ? "bg-white/[0.02]" : "glass"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${config.color}12` }}
                >
                  <Icon size={14} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium truncate ${n.read ? "text-neutral-400" : "text-white"}`}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: config.color }}
                      />
                    )}
                  </div>
                  <p
                    className={`text-[12px] mt-0.5 ${n.read ? "text-neutral-600" : "text-neutral-400"}`}
                  >
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                    <span className="text-neutral-600 text-[10px]">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n._id);
                  }}
                  className="text-neutral-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
