import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function StatCard({ icon, iconColor, value, label }) {
  return (
    <View className="flex-1 mx-1.5">
      <View
        className="rounded-2xl px-3.5 py-3.5"
        style={{
          backgroundColor: "#E3DAC4",
          borderWidth: 1,
          borderColor: "#BFB39B",
        }}
      >
        <View className="flex-row items-center justify-between mb-2.5">
          <View
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <View
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: iconColor, opacity: 0.5 }}
          />
        </View>
        <Text className="text-ink text-2xl font-jakarta-bold tracking-tight">
          {value}
        </Text>
        <Text className="text-ink-muted text-[10px] font-sans-semibold mt-0.5 tracking-widest uppercase">
          {label}
        </Text>
      </View>
    </View>
  );
}

export default function QuickStats({
  publishedCount,
  platformCount,
  scheduledCount,
}) {
  return (
    <View className="flex-row mb-4 -mx-1.5">
      <StatCard
        icon="checkmark-circle"
        iconColor="#B14026"
        value={publishedCount}
        label="Published"
      />
      <StatCard
        icon="globe-outline"
        iconColor="#60a5fa"
        value={platformCount}
        label="Platforms"
      />
      <StatCard
        icon="time-outline"
        iconColor="#a78bfa"
        value={scheduledCount}
        label="Scheduled"
      />
    </View>
  );
}
