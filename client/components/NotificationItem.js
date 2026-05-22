import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TYPE_CONFIG = {
  post_published: { icon: "checkmark-circle", color: "#4F573A", label: "Published" },
  post_failed: { icon: "close-circle", color: "#B14026", label: "Failed" },
  post_partial: { icon: "alert-circle", color: "#8E311B", label: "Partial" },
  post_scheduled: { icon: "time", color: "#4F573A", label: "Scheduled" },
  schedule_reminder: { icon: "alarm", color: "#4F573A", label: "Reminder" },
  platform_connected: { icon: "link", color: "#4F573A", label: "Connected" },
  platform_disconnected: { icon: "unlink", color: "#B14026", label: "Disconnected" },
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
      className="mb-2"
    >
      <View
        className="rounded-2xl p-3.5"
        style={{
          backgroundColor: isUnread ? "#E3DAC4" : "#DDD3BD",
          borderWidth: 1,
          borderColor: isUnread ? `${config.color}20` : "#E3DAC4",
        }}
      >
        <View className="flex-row items-start">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: `${config.color}15` }}
          >
            <Ionicons name={config.icon} size={18} color={config.color} />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-0.5">
              <View className="flex-row items-center flex-1 mr-2">
                <Text
                  className={`text-[13px] font-sans-bold flex-shrink ${isUnread ? "text-ink" : "text-ink-muted"}`}
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
              <Text className="text-ink-soft text-[10px] font-sans-medium flex-shrink-0">
                {getTimeAgo(notif.createdAt)}
              </Text>
            </View>

            <Text
              className={`text-[11px] leading-[16px] mb-2 ${isUnread ? "text-ink-muted" : "text-ink-soft"}`}
              numberOfLines={2}
            >
              {notif.message}
            </Text>

            <View
              className="rounded-md px-2 py-0.5 self-start"
              style={{ backgroundColor: `${config.color}12` }}
            >
              <Text
                className="text-[8px] font-sans-semibold uppercase tracking-wider"
                style={{ color: config.color }}
              >
                {config.label}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
