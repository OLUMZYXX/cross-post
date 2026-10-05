"use client";

import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import useNotifications from "@/hooks/useNotifications";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import NotificationItem from "@/components/notifications/NotificationItem";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markAllRead, clearAll, markRead, remove } = useNotifications();

  if (loading) return <Spinner className="py-24" />;

  const actions =
    notifications.length > 0 ? (
      <>
        {unreadCount > 0 ? (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all read
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <Trash2 size={15} /> Clear
        </Button>
      </>
    ) : null;

  return (
    <div className="animate-fade-in max-w-2xl">
      <PageHeader
        eyebrow={unreadCount > 0 ? `${unreadCount} unread` : "Inbox"}
        title="Notifications"
        actions={actions}
      />

      {notifications.length === 0 ? (
        <div className="rounded-3xl bg-cp-card border border-cp-rule">
          <EmptyState icon={BellOff} title="All caught up" body="We'll let you know when posts go out, fail, or are about to publish." />
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((item) => (
            <NotificationItem key={item._id} item={item} onOpen={markRead} onDelete={remove} />
          ))}
        </ul>
      )}
    </div>
  );
}
