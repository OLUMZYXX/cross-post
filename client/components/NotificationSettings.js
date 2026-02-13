import { useState } from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "./Toast";

export default function NotificationSettings({ onBack }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [postAlerts, setPostAlerts] = useState(true);
  const [scheduleReminders, setScheduleReminders] = useState(true);
  const { showToast } = useToast();

  const toggles = [
    { label: "Push Notifications", desc: "Receive alerts on your device", value: pushEnabled, setter: setPushEnabled },
    { label: "Email Notifications", desc: "Get updates via email", value: emailEnabled, setter: setEmailEnabled },
    { label: "Post Published Alerts", desc: "Notify when posts go live", value: postAlerts, setter: setPostAlerts },
    { label: "Schedule Reminders", desc: "Remind before scheduled posts", value: scheduleReminders, setter: setScheduleReminders },
  ];

  const handleToggle = (setter, current, label) => {
    setter(!current);
    showToast({
      type: "success",
      title: `${label} ${!current ? "enabled" : "disabled"}`,
      duration: 1500,
    });
  };

  return (
    <View className="flex-1 bg-gray-950 px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-gray-900/80 rounded-2xl border border-gray-800">
          {toggles.map((item, i) => (
            <View
              key={item.label}
              className={`flex-row items-center p-4 ${i < toggles.length - 1 ? "border-b border-gray-800" : ""}`}
            >
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">{item.label}</Text>
                <Text className="text-gray-500 text-xs mt-0.5">{item.desc}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={() => handleToggle(item.setter, item.value, item.label)}
                trackColor={{ false: "#374151", true: "#166534" }}
                thumbColor={item.value ? "#4ade80" : "#9ca3af"}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
