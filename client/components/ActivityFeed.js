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
  const iconColor = isPost ? "#B14026" : "#60a5fa";
  const badgeText = isPost ? "Published" : "Connected";

  return (
    <View
      className="flex-row items-center py-3.5"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: "#E3DAC4" } : {}}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={iconName} size={16} color={iconColor} />
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-ink text-[13px] font-sans-semibold" numberOfLines={1}>
          {activity.title}
        </Text>
        <View className="flex-row items-center mt-1">
          <View className="rounded-full px-2 py-0.5 mr-2" style={{ backgroundColor: `${iconColor}12` }}>
            <Text className="text-[9px] font-sans-bold" style={{ color: iconColor }}>{badgeText}</Text>
          </View>
          {activity.platforms > 0 && (
            <Text className="text-ink-soft text-[10px]">
              {activity.platforms} platform{activity.platforms !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>
      <Text className="text-ink-soft text-[10px] font-sans-medium">
        {getRelativeTime(activity.timestamp)}
      </Text>
    </View>
  );
}

export default function ActivityFeed({ activities }) {
  if (!activities.length) {
    return (
      <View
        className="rounded-2xl p-6 items-center"
        style={{
          backgroundColor: "#E3DAC4",
          borderWidth: 1,
          borderColor: "#BFB39B",
        }}
      >
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: "#E3DAC4" }}
        >
          <Ionicons name="pulse-outline" size={22} color="#564B3F" />
        </View>
        <Text className="text-ink text-sm font-sans-semibold mb-1">No activity yet</Text>
        <Text className="text-ink-soft text-xs text-center">
          Your posts and connections will show up here
        </Text>
      </View>
    );
  }

  return (
    <View
      className="rounded-2xl px-4"
      style={{
        backgroundColor: "#E3DAC4",
        borderWidth: 1,
        borderColor: "#BFB39B",
      }}
    >
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
