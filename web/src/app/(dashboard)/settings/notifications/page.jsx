"use client";

import useNotificationPrefs from "@/hooks/useNotificationPrefs";
import SubPageHeader from "@/components/settings/SubPageHeader";
import Toggle from "@/components/settings/Toggle";
import Spinner from "@/components/ui/Spinner";

const PREFS = [
  { key: "pushEnabled", label: "Push notifications", desc: "Alerts on your phone" },
  { key: "emailEnabled", label: "Email notifications", desc: "Updates in your inbox" },
  { key: "postAlerts", label: "Post alerts", desc: "When posts publish, fail, or go live" },
  { key: "scheduleReminders", label: "Schedule reminders", desc: "Just before scheduled posts go out" },
];

export default function NotificationSettingsPage() {
  const { prefs, loading, toggle } = useNotificationPrefs();

  if (loading) return <Spinner className="py-24" />;

  return (
    <div className="animate-fade-in max-w-lg">
      <SubPageHeader title="Notifications" subtitle="Choose what Crosspost tells you about." />

      <div className="rounded-3xl bg-cp-card border border-cp-rule divide-y divide-cp-rule">
        {PREFS.map((pref) => (
          <div key={pref.key} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-cp-ink text-[15px] font-semibold">{pref.label}</p>
              <p className="text-cp-muted text-[13px]">{pref.desc}</p>
            </div>
            <Toggle checked={Boolean(prefs[pref.key])} onChange={() => toggle(pref.key)} label={pref.label} />
          </div>
        ))}
      </div>
    </div>
  );
}
