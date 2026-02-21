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

export default function NotificationSettings({ onBack }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [postAlerts, setPostAlerts] = useState(true);
  const [scheduleReminders, setScheduleReminders] = useState(true);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load saved preferences from server
  useEffect(() => {
    (async () => {
      try {
        const { data } = await notificationAPI.getPreferences();
        const prefs = data.preferences;
        setPushEnabled(prefs.pushEnabled ?? true);
        setEmailEnabled(prefs.emailEnabled ?? false);
        setPostAlerts(prefs.postAlerts ?? true);
        setScheduleReminders(prefs.scheduleReminders ?? true);
      } catch {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggles = [
    {
      label: "Push Notifications",
      desc: "Receive alerts on your device",
      value: pushEnabled,
      key: "pushEnabled",
      icon: "notifications",
      color: "#a855f7",
    },
    {
      label: "Email Notifications",
      desc: "Get updates via email",
      value: emailEnabled,
      key: "emailEnabled",
      icon: "mail",
      color: "#3b82f6",
    },
    {
      label: "Post Published Alerts",
      desc: "Notify when posts go live or fail",
      value: postAlerts,
      key: "postAlerts",
      icon: "paper-plane",
      color: "#4ade80",
    },
    {
      label: "Schedule Reminders",
      desc: "Remind before scheduled posts",
      value: scheduleReminders,
      key: "scheduleReminders",
      icon: "time",
      color: "#f59e0b",
    },
  ];

  const setters = {
    pushEnabled: setPushEnabled,
    emailEnabled: setEmailEnabled,
    postAlerts: setPostAlerts,
    scheduleReminders: setScheduleReminders,
  };

  const handleToggle = async (key, current, label) => {
    const newValue = !current;
    setters[key](newValue);

    try {
      await notificationAPI.updatePreferences({ [key]: newValue });
      showToast({
        type: "success",
        title: `${label} ${newValue ? "enabled" : "disabled"}`,
        duration: 1500,
      });
    } catch {
      // Revert on error
      setters[key](current);
      showToast({
        type: "error",
        title: "Failed to update",
        message: "Could not save preference. Try again.",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-950 px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 text-xs uppercase font-semibold mb-3 ml-1">
          Notification Channels
        </Text>
        <View className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-6">
          {toggles.slice(0, 2).map((item, i) => (
            <View
              key={item.key}
              className={`flex-row items-center p-4 ${i === 0 ? "border-b border-gray-800" : ""}`}
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: item.color + "20" }}
              >
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">
                  {item.label}
                </Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  {item.desc}
                </Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={() =>
                  handleToggle(item.key, item.value, item.label)
                }
                trackColor={{ false: "#374151", true: "#166534" }}
                thumbColor={item.value ? "#4ade80" : "#9ca3af"}
              />
            </View>
          ))}
        </View>

        <Text className="text-gray-500 text-xs uppercase font-semibold mb-3 ml-1">
          Alert Types
        </Text>
        <View className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-6">
          {toggles.slice(2).map((item, i) => (
            <View
              key={item.key}
              className={`flex-row items-center p-4 ${i === 0 ? "border-b border-gray-800" : ""}`}
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: item.color + "20" }}
              >
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">
                  {item.label}
                </Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  {item.desc}
                </Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={() =>
                  handleToggle(item.key, item.value, item.label)
                }
                trackColor={{ false: "#374151", true: "#166534" }}
                thumbColor={item.value ? "#4ade80" : "#9ca3af"}
              />
            </View>
          ))}
        </View>

        <View className="bg-gray-900/50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={16} color="#6b7280" />
            <Text className="text-gray-400 text-xs font-medium ml-1.5">
              About Notifications
            </Text>
          </View>
          <Text className="text-gray-500 text-xs leading-4">
            Push notifications alert you when posts are published, fail, or are
            about to go live from a schedule. You can turn off specific
            categories above.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
