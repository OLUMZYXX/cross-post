import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function StatCard({ icon, iconColor, iconBg, value, label, isFirst, isLast }) {
  const ml = isFirst ? "" : "ml-1.5";
  const mr = isLast ? "" : "mr-1.5";

  return (
    <View className={`flex-1 bg-gray-900 rounded-2xl px-3 py-3 border border-gray-800/60 ${ml} ${mr}`}>
      <View className="flex-row items-center mb-2">
        <View className={`w-6 h-6 rounded-lg ${iconBg} items-center justify-center mr-1.5`}>
          <Ionicons name={icon} size={12} color={iconColor} />
        </View>
        <Text className="text-gray-500 text-[10px]">{label}</Text>
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
    </View>
  );
}

export default function QuickStats({ publishedCount, platformCount, scheduledCount }) {
  return (
    <View className="flex-row mb-5">
      <StatCard
        icon="checkmark-circle"
        iconColor="#4ade80"
        iconBg="bg-green-500/15"
        value={publishedCount}
        label="Published"
        isFirst
      />
      <StatCard
        icon="globe-outline"
        iconColor="#60a5fa"
        iconBg="bg-blue-500/15"
        value={platformCount}
        label="Platforms"
      />
      <StatCard
        icon="time-outline"
        iconColor="#a78bfa"
        iconBg="bg-purple-500/15"
        value={scheduledCount}
        label="Scheduled"
        isLast
      />
    </View>
  );
}
