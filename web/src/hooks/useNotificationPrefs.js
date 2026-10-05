"use client";

import { useEffect, useState } from "react";
import { notificationAPI } from "@/services/notificationService";
import { useToast } from "@/context/ToastContext";

export default function useNotificationPrefs() {
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await notificationAPI.getPreferences();
        if (!cancelled) setPrefs(data?.preferences || data || {});
      } catch {
        if (!cancelled) showToast({ type: "error", title: "Couldn't load your preferences" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const toggle = async (key) => {
    const previous = prefs;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await notificationAPI.updatePreferences(updated);
    } catch {
      setPrefs(previous);
      showToast({ type: "error", title: "Couldn't save that change" });
    }
  };

  return { prefs, loading, toggle };
}
