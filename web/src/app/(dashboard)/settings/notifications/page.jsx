"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notificationAPI } from "@/services/notificationService";
import { useToast } from "@/context/ToastContext";
import Spinner from "@/components/ui/Spinner";

const PREFS = [
  {
    key: "pushEnabled",
    label: "Push Notifications",
    desc: "Receive push alerts on your device",
  },
  {
    key: "emailEnabled",
    label: "Email Notifications",
    desc: "Get email updates",
  },
  {
    key: "postAlerts",
    label: "Post Alerts",
    desc: "When posts publish, fail, or go live",
  },
  {
    key: "scheduleReminders",
    label: "Schedule Reminders",
    desc: "Before scheduled posts go out",
  },
];

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await notificationAPI.getPreferences();
        setPrefs(data.preferences || data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await notificationAPI.updatePreferences(updated);
    } catch {
      setPrefs(prefs);
      showToast({ type: "error", title: "Failed to update" });
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/settings"
          className="text-neutral-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-white font-headline">
          Notifications
        </h1>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {PREFS.map((pref, i) => (
          <div
            key={pref.key}
            className={`flex items-center justify-between px-4 py-3.5 ${
              i < PREFS.length - 1 ? "border-b border-white/[0.04]" : ""
            }`}
          >
            <div>
              <p className="text-white text-sm">{pref.label}</p>
              <p className="text-neutral-600 text-[11px]">{pref.desc}</p>
            </div>
            <button
              onClick={() => toggle(pref.key)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                prefs?.[pref.key] ? "bg-green-500" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  prefs?.[pref.key] ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
