import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "./Toast";
import { notificationAPI } from "../services/api";

const TOGGLES = [
  {
    label: "Push Notifications",
    desc: "Receive alerts on your device",
    key: "pushEnabled",
    icon: "notifications",
    color: "#a855f7",
    section: "channels",
  },
  {
    label: "Email Notifications",
    desc: "Get updates via email",
    key: "emailEnabled",
    icon: "mail",
    color: "#3b82f6",
    section: "channels",
  },
  {
    label: "Post Published Alerts",
    desc: "Notify when posts go live or fail",
    key: "postAlerts",
    icon: "paper-plane",
    color: "#4ade80",
    section: "alerts",
  },
  {
    label: "Schedule Reminders",
    desc: "Remind before scheduled posts",
    key: "scheduleReminders",
    icon: "time",
    color: "#f59e0b",
    section: "alerts",
  },
];

function ToggleRow({ item, onToggle, isLast }) {
  return (
    <View className={`flex-row items-center p-4 ${!isLast ? "border-b border-gray-800/50" : ""}`}>
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: item.color + "20" }}
      >
        <Ionicons name={item.icon} size={17} color={item.color} />
      </View>
      <View className="flex-1">
        <Text className="text-white text-sm font-medium">{item.label}</Text>
        <Text className="text-gray-500 text-[11px] mt-0.5">{item.desc}</Text>
      </View>
      <Switch
        value={item.value}
        onValueChange={() => onToggle(item.key, item.value, item.label)}
        trackColor={{ false: "#374151", true: "#166534" }}
        thumbColor={item.value ? "#4ade80" : "#9ca3af"}
      />
    </View>
  );
}

export default function NotificationSettings({ onBack }) {
  const [prefs, setPrefs] = useState({
    pushEnabled: true,
    emailEnabled: false,
    postAlerts: true,
    scheduleReminders: true,
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await notificationAPI.getPreferences();
        const p = data.preferences;
        setPrefs({
          pushEnabled: p.pushEnabled ?? true,
          emailEnabled: p.emailEnabled ?? false,
          postAlerts: p.postAlerts ?? true,
          scheduleReminders: p.scheduleReminders ?? true,
        });
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggle = async (key, current, label) => {
    const newValue = !current;
    setPrefs((prev) => ({ ...prev, [key]: newValue }));
    try {
      await notificationAPI.updatePreferences({ [key]: newValue });
      showToast({ type: "success", title: `${label} ${newValue ? "enabled" : "disabled"}`, duration: 1500 });
    } catch {
      setPrefs((prev) => ({ ...prev, [key]: current }));
      showToast({ type: "error", title: "Failed to update", duration: 2000 });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  const channels = TOGGLES.filter((t) => t.section === "channels").map((t) => ({ ...t, value: prefs[t.key] }));
  const alerts = TOGGLES.filter((t) => t.section === "alerts").map((t) => ({ ...t, value: prefs[t.key] }));

  return (
    <View className="flex-1 bg-gray-950 px-5 pt-14">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-xl bg-gray-900 items-center justify-center mr-3 border border-gray-800/60"
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-gray-500 text-[10px] tracking-wider uppercase mb-2 ml-1">
          Channels
        </Text>
        <View className="bg-gray-900 rounded-2xl border border-gray-800/60 mb-5">
          {channels.map((item, i) => (
            <ToggleRow key={item.key} item={item} onToggle={handleToggle} isLast={i === channels.length - 1} />
          ))}
        </View>

        <Text className="text-gray-500 text-[10px] tracking-wider uppercase mb-2 ml-1">
          Alert Types
        </Text>
        <View className="bg-gray-900 rounded-2xl border border-gray-800/60 mb-5">
          {alerts.map((item, i) => (
            <ToggleRow key={item.key} item={item} onToggle={handleToggle} isLast={i === alerts.length - 1} />
          ))}
        </View>

        <View className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/40">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={15} color="#4b5563" />
            <Text className="text-gray-500 text-[11px] font-medium ml-1.5">About</Text>
          </View>
          <Text className="text-gray-600 text-[11px] leading-4">
            Push notifications alert you when posts are published, fail, or go
            live from a schedule. Toggle specific categories above.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
