import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

function StatCard({ icon, iconColor, gradientColors, value, label, borderColor }) {
  return (
    <View className="flex-1 mx-1.5">
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-[1px]"
      >
        <View className="bg-gray-950 rounded-2xl px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${iconColor}15` }}
            >
              <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: iconColor, opacity: 0.6 }}
            />
          </View>
          <Text className="text-white text-3xl font-bold tracking-tight">{value}</Text>
          <Text className="text-gray-500 text-[11px] font-medium mt-1 tracking-wide uppercase">
            {label}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function QuickStats({ publishedCount, platformCount, scheduledCount }) {
  return (
    <View className="flex-row mb-5 -mx-1.5">
      <StatCard
        icon="checkmark-circle"
        iconColor="#4ade80"
        gradientColors={["#4ade8040", "#4ade8010", "transparent"]}
        value={publishedCount}
        label="Published"
      />
      <StatCard
        icon="globe-outline"
        iconColor="#60a5fa"
        gradientColors={["#60a5fa40", "#60a5fa10", "transparent"]}
        value={platformCount}
        label="Platforms"
      />
      <StatCard
        icon="time-outline"
        iconColor="#a78bfa"
        gradientColors={["#a78bfa40", "#a78bfa10", "transparent"]}
        value={scheduledCount}
        label="Scheduled"
      />
    </View>
  );
}
