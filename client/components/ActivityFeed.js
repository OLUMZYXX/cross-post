import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function getRelativeTime(timestamp) {
  const now = new Date();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ActivityRow({ activity, isLast }) {
  const isPost = activity.type === "post";
  const iconName = isPost ? "paper-plane" : "link";
  const iconColor = isPost ? "#4ade80" : "#60a5fa";
  const iconBg = isPost ? "bg-green-500/15" : "bg-blue-500/15";
  const badgeText = isPost ? "Published" : "Connected";
  const badgeBg = isPost ? "bg-green-500/10" : "bg-blue-500/10";
  const badgeTextColor = isPost ? "text-green-400" : "text-blue-400";

  return (
    <View className={`flex-row items-center py-3.5 ${!isLast ? "border-b border-gray-800/50" : ""}`}>
      <View className={`w-10 h-10 rounded-xl ${iconBg} items-center justify-center mr-3`}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-white text-sm font-medium" numberOfLines={1}>
          {activity.title}
        </Text>
        <View className="flex-row items-center mt-1.5">
          <View className={`${badgeBg} rounded-full px-2 py-0.5 mr-2`}>
            <Text className={`${badgeTextColor} text-[10px] font-medium`}>{badgeText}</Text>
          </View>
          {activity.platforms > 0 && (
            <Text className="text-gray-600 text-[10px]">
              {activity.platforms} platform{activity.platforms !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>
      <Text className="text-gray-600 text-[10px]">{getRelativeTime(activity.timestamp)}</Text>
    </View>
  );
}

export default function ActivityFeed({ activities }) {
  if (!activities.length) {
    return (
      <View className="bg-gray-900 rounded-2xl p-6 border border-gray-800/60 items-center">
        <View className="w-12 h-12 rounded-2xl bg-gray-800 items-center justify-center mb-3">
          <Ionicons name="pulse-outline" size={22} color="#6b7280" />
        </View>
        <Text className="text-gray-300 text-sm font-medium mb-1">No activity yet</Text>
        <Text className="text-gray-600 text-xs text-center">
          Your posts and connections will show up here
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-gray-900 rounded-2xl px-4 border border-gray-800/60">
      {activities.map((activity, index) => (
        <ActivityRow
          key={activity.id}
          activity={activity}
          isLast={index === activities.length - 1}
        />
      ))}
    </View>
  );
}
