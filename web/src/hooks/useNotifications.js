"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationAPI } from "@/services/notificationService";
import { useToast } from "@/context/ToastContext";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const { data } = await notificationAPI.list();
      setNotifications(data?.notifications || []);
    } catch {
      showToast({ type: "error", title: "Couldn't load notifications" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      showToast({ type: "error", title: "Couldn't mark them as read" });
    }
  };

  const clearAll = async () => {
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
    } catch {
      showToast({ type: "error", title: "Couldn't clear notifications" });
    }
  };

  const markRead = async (item) => {
    if (item.read) return;
    setNotifications((prev) => prev.map((entry) => (entry._id === item._id ? { ...entry, read: true } : entry)));
    try {
      await notificationAPI.markAsRead(item._id);
    } catch {
      setNotifications((prev) => prev.map((entry) => (entry._id === item._id ? { ...entry, read: false } : entry)));
    }
  };

  const remove = async (id) => {
    const previous = notifications;
    setNotifications((prev) => prev.filter((entry) => entry._id !== id));
    try {
      await notificationAPI.delete(id);
    } catch {
      setNotifications(previous);
      showToast({ type: "error", title: "Couldn't delete that notification" });
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return { notifications, loading, unreadCount, markAllRead, clearAll, markRead, remove };
}
