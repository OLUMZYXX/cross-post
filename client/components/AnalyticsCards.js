import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function StatCard({ label, value, subtitle, icon, iconColor, iconBg }) {
  return (
    <View className="flex-1 bg-paper-light rounded-2xl p-4 border border-rule">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-ink-muted text-xs">{label}</Text>
        {icon && (
          <View className={`w-7 h-7 rounded-lg ${iconBg || "bg-paper-deep"} items-center justify-center`}>
            <Ionicons name={icon} size={14} color={iconColor || "#564B3F"} />
          </View>
        )}
      </View>
      <Text className="text-ink text-2xl font-serif-bold">{value}</Text>
      {subtitle && <Text className="text-ink-muted text-xs mt-1">{subtitle}</Text>}
    </View>
  );
}

export function SuccessRateRing({ successRate, totalSuccess, totalFailed }) {
  const ringColor = successRate >= 80 ? "#B14026" : successRate >= 50 ? "#8E311B" : "#B14026";
  const ringBg = successRate >= 80 ? "bg-terracotta-soft/30" : successRate >= 50 ? "bg-paper-deep" : "bg-terracotta/15";

  return (
    <View className="bg-paper-light rounded-2xl p-5 border border-rule mb-4">
      <Text className="text-ink-muted text-xs mb-4">OVERALL SUCCESS RATE</Text>
      <View className="flex-row items-center">
        <View className={`w-20 h-20 rounded-full ${ringBg} items-center justify-center mr-4`} style={{ borderWidth: 4, borderColor: ringColor }}>
          <Text className="text-ink text-xl font-serif-bold">{successRate}%</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 rounded-full bg-terracotta mr-2" />
            <Text className="text-ink text-sm flex-1">Successful</Text>
            <Text className="text-terracotta font-sans-bold">{totalSuccess}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-terracotta mr-2" />
            <Text className="text-ink text-sm flex-1">Failed</Text>
            <Text className="text-terracotta font-sans-bold">{totalFailed}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function WeeklyChart({ days, maxCount }) {
  return (
    <View className="bg-paper-light rounded-2xl p-5 border border-rule mb-4">
      <Text className="text-ink-muted text-xs mb-4">WEEKLY ACTIVITY</Text>
      <View className="flex-row items-end justify-between" style={{ height: 100 }}>
        {days.map((day, i) => {
          const barHeight = maxCount > 0 ? Math.max((day.count / maxCount) * 80, day.count > 0 ? 8 : 3) : 3;
          const isToday = i === days.length - 1;
          return (
            <View key={day.label} className="items-center flex-1">
              <Text className="text-ink-muted text-[10px] mb-1">
                {day.count > 0 ? day.count : ""}
              </Text>
              <View
                className={`w-6 rounded-t-lg ${isToday ? "bg-terracotta" : day.count > 0 ? "bg-terracotta/40" : "bg-paper-deep"}`}
                style={{ height: barHeight }}
              />
              <Text className={`text-[10px] mt-1.5 ${isToday ? "text-terracotta font-sans-bold" : "text-ink-muted"}`}>
                {day.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function MediaBreakdown({ withMedia, textOnly, totalMedia }) {
  const total = withMedia + textOnly;
  const mediaPercent = total > 0 ? Math.round((withMedia / total) * 100) : 0;

  return (
    <View className="bg-paper-light rounded-2xl p-5 border border-rule mb-4">
      <Text className="text-ink-muted text-xs mb-4">CONTENT BREAKDOWN</Text>
      <View className="flex-row mb-3">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Ionicons name="image" size={14} color="#a78bfa" />
            <Text className="text-ink text-sm ml-1.5">With Media</Text>
          </View>
          <Text className="text-ink text-xl font-serif-bold">{withMedia}</Text>
          <Text className="text-ink-muted text-xs">{totalMedia} files total</Text>
        </View>
        <View className="flex-1 ml-2">
          <View className="flex-row items-center mb-1">
            <Ionicons name="text" size={14} color="#60a5fa" />
            <Text className="text-ink text-sm ml-1.5">Text Only</Text>
          </View>
          <Text className="text-ink text-xl font-serif-bold">{textOnly}</Text>
          <Text className="text-ink-muted text-xs">{100 - mediaPercent}% of posts</Text>
        </View>
      </View>
      <View className="h-2 bg-paper-deep rounded-full overflow-hidden">
        <View
          className="h-full bg-olive rounded-full"
          style={{ width: `${mediaPercent}%` }}
        />
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-olive text-[10px]">Media {mediaPercent}%</Text>
        <Text className="text-olive text-[10px]">Text {100 - mediaPercent}%</Text>
      </View>
    </View>
  );
}
