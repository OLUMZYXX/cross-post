import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TYPE_CONFIG = {
  post_published: { icon: "checkmark-circle", color: "#4ade80", bg: "bg-green-500/15" },
  post_failed: { icon: "close-circle", color: "#f87171", bg: "bg-red-500/15" },
  post_partial: { icon: "alert-circle", color: "#f59e0b", bg: "bg-yellow-500/15" },
  post_scheduled: { icon: "time", color: "#3b82f6", bg: "bg-blue-500/15" },
  schedule_reminder: { icon: "alarm", color: "#a855f7", bg: "bg-purple-500/15" },
  platform_connected: { icon: "link", color: "#22c55e", bg: "bg-green-500/15" },
  platform_disconnected: { icon: "unlink", color: "#ef4444", bg: "bg-red-500/15" },
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

  return (
    <TouchableOpacity
      onPress={() => onPress(notif)}
      onLongPress={() => onDelete(notif._id)}
      className={`flex-row items-start p-3.5 rounded-2xl mb-2 ${
        notif.read
          ? "bg-gray-900/40 border border-gray-800/40"
          : "bg-gray-900 border border-gray-800/80"
      }`}
      activeOpacity={0.7}
    >
      <View className={`w-10 h-10 rounded-xl ${config.bg} items-center justify-center mr-3`}>
        <Ionicons name={config.icon} size={18} color={config.color} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            className={`text-sm font-semibold flex-1 mr-2 ${notif.read ? "text-gray-400" : "text-white"}`}
            numberOfLines={1}
          >
            {notif.title}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-gray-600 text-[10px]">{getTimeAgo(notif.createdAt)}</Text>
            {!notif.read && (
              <View className="w-2 h-2 rounded-full bg-green-400 ml-2" />
            )}
          </View>
        </View>
        <Text
          className={`text-xs leading-4 ${notif.read ? "text-gray-600" : "text-gray-400"}`}
          numberOfLines={2}
        >
          {notif.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
