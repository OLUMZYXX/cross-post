import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const TYPE_CONFIG = {
  post_published: {
    icon: "checkmark-circle",
    color: "#4ade80",
    label: "Published",
  },
  post_failed: {
    icon: "close-circle",
    color: "#f87171",
    label: "Failed",
  },
  post_partial: {
    icon: "alert-circle",
    color: "#f59e0b",
    label: "Partial",
  },
  post_scheduled: {
    icon: "time",
    color: "#3b82f6",
    label: "Scheduled",
  },
  schedule_reminder: {
    icon: "alarm",
    color: "#a855f7",
    label: "Reminder",
  },
  platform_connected: {
    icon: "link",
    color: "#22c55e",
    label: "Connected",
  },
  platform_disconnected: {
    icon: "unlink",
    color: "#ef4444",
    label: "Disconnected",
  },
};

function getTimeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export { TYPE_CONFIG, getTimeAgo };

export default function NotificationItem({ notif, onPress, onDelete }) {
  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.post_published;
  const isUnread = !notif.read;

  return (
    <TouchableOpacity
      onPress={() => onPress(notif)}
      onLongPress={() => onDelete(notif._id)}
      activeOpacity={0.7}
      className="mb-2.5"
    >
      <LinearGradient
        colors={
          isUnread
            ? [`${config.color}25`, `${config.color}08`, "transparent"]
            : ["transparent", "transparent"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-[1px]"
      >
        <View
          className={`rounded-2xl p-4 ${
            isUnread ? "bg-gray-950" : "bg-gray-900/30"
          }`}
        >
          <View className="flex-row items-start">
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <Ionicons name={config.icon} size={20} color={config.color} />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center flex-1 mr-2">
                  <Text
                    className={`text-sm font-bold flex-shrink ${
                      isUnread ? "text-white" : "text-gray-400"
                    }`}
                    numberOfLines={1}
                  >
                    {notif.title}
                  </Text>
                  {isUnread && (
                    <View
                      className="w-2 h-2 rounded-full ml-2 flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                  )}
                </View>
                <Text className="text-gray-600 text-[10px] font-medium flex-shrink-0">
                  {getTimeAgo(notif.createdAt)}
                </Text>
              </View>

              <Text
                className={`text-[12px] leading-[18px] mb-2 ${
                  isUnread ? "text-gray-400" : "text-gray-600"
                }`}
                numberOfLines={2}
              >
                {notif.message}
              </Text>

              <View className="flex-row items-center">
                <View
                  className="rounded-lg px-2 py-0.5"
                  style={{ backgroundColor: `${config.color}12` }}
                >
                  <Text
                    className="text-[9px] font-semibold uppercase tracking-wider"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
