import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PLATFORM_ICONS = {
  Twitter: { icon: "logo-twitter", color: "#1DA1F2" },
  Instagram: { icon: "logo-instagram", color: "#E4405F" },
  LinkedIn: { icon: "logo-linkedin", color: "#0A66C2" },
  Facebook: { icon: "logo-facebook", color: "#1877F2" },
  TikTok: { icon: "logo-tiktok", color: "#fff" },
  YouTube: { icon: "logo-youtube", color: "#FF0000" },
  Reddit: { icon: "logo-reddit", color: "#FF4500" },
  Telegram: { icon: "paper-plane", color: "#0EA5E9" },
};

function PlatformRow({ platform }) {
  const info = PLATFORM_ICONS[platform.name] || { icon: "globe-outline", color: "#564B3F" };
  const attempts = platform.success + platform.failed;
  const rateColor =
    platform.successRate >= 80 ? "text-terracotta" : platform.successRate >= 50 ? "text-terracotta-shadow" : "text-terracotta";
  const barColor =
    platform.successRate >= 80 ? "bg-terracotta" : platform.successRate >= 50 ? "bg-terracotta-shadow" : "bg-terracotta";

  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-xl bg-paper-deep items-center justify-center mr-3">
          <Ionicons name={info.icon} size={15} color={info.color} />
        </View>
        <View className="flex-1">
          <Text className="text-ink text-sm font-sans-medium">{platform.name}</Text>
          <Text className="text-ink-muted text-[10px] mt-0.5">
            {platform.total} post{platform.total !== 1 ? "s" : ""} targeted
          </Text>
        </View>
        <View className="items-end">
          <Text className={`text-base font-sans-bold ${rateColor}`}>{platform.successRate}%</Text>
          <Text className="text-ink-soft text-[10px]">
            {platform.success}/{attempts} sent
          </Text>
        </View>
      </View>
      <View className="h-1.5 bg-paper-deep rounded-full overflow-hidden ml-11">
        <View className={`h-full ${barColor} rounded-full`} style={{ width: `${platform.successRate}%` }} />
      </View>
    </View>
  );
}

export default function PlatformBreakdown({ platformStats }) {
  if (!platformStats.length) return null;

  return (
    <View className="bg-paper-light rounded-2xl p-5 border border-rule mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-ink-muted text-xs tracking-wider">PLATFORM PERFORMANCE</Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-terracotta mr-1" />
          <Text className="text-ink-soft text-[10px] mr-3">Success</Text>
          <View className="w-2 h-2 rounded-full bg-terracotta mr-1" />
          <Text className="text-ink-soft text-[10px]">Failed</Text>
        </View>
      </View>
      {platformStats.map((platform) => (
        <PlatformRow key={platform.name} platform={platform} />
      ))}
    </View>
  );
}
