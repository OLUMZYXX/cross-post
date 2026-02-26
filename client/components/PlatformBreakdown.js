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
  const info = PLATFORM_ICONS[platform.name] || { icon: "globe-outline", color: "#9ca3af" };
  const attempts = platform.success + platform.failed;
  const rateColor =
    platform.successRate >= 80 ? "text-green-400" : platform.successRate >= 50 ? "text-yellow-400" : "text-red-400";
  const barColor =
    platform.successRate >= 80 ? "bg-green-500" : platform.successRate >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-xl bg-gray-800 items-center justify-center mr-3">
          <Ionicons name={info.icon} size={15} color={info.color} />
        </View>
        <View className="flex-1">
          <Text className="text-white text-sm font-medium">{platform.name}</Text>
          <Text className="text-gray-500 text-[10px] mt-0.5">
            {platform.total} post{platform.total !== 1 ? "s" : ""} targeted
          </Text>
        </View>
        <View className="items-end">
          <Text className={`text-base font-bold ${rateColor}`}>{platform.successRate}%</Text>
          <Text className="text-gray-600 text-[10px]">
            {platform.success}/{attempts} sent
          </Text>
        </View>
      </View>
      <View className="h-1.5 bg-gray-800 rounded-full overflow-hidden ml-11">
        <View className={`h-full ${barColor} rounded-full`} style={{ width: `${platform.successRate}%` }} />
      </View>
    </View>
  );
}

export default function PlatformBreakdown({ platformStats }) {
  if (!platformStats.length) return null;

  return (
    <View className="bg-gray-900/80 rounded-2xl p-5 border border-gray-800 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-400 text-xs tracking-wider">PLATFORM PERFORMANCE</Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
          <Text className="text-gray-600 text-[10px] mr-3">Success</Text>
          <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
          <Text className="text-gray-600 text-[10px]">Failed</Text>
        </View>
      </View>
      {platformStats.map((platform) => (
        <PlatformRow key={platform.name} platform={platform} />
      ))}
    </View>
  );
}
