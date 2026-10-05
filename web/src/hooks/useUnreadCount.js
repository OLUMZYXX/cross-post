"use client";

import { useEffect, useState } from "react";
import { notificationAPI } from "@/services/notificationService";

const POLL_MS = 120000;

export default function useUnreadCount(enabled) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const { data } = await notificationAPI.list();
        if (!cancelled) setUnreadCount(data?.unreadCount || 0);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled]);

  return unreadCount;
}
