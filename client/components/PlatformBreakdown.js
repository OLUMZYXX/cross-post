import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PLATFORM_ICONS = {
  Twitter: { icon: "logo-twitter", bg: "bg-blue-500" },
  Instagram: { icon: "logo-instagram", bg: "bg-pink-500" },
  LinkedIn: { icon: "logo-linkedin", bg: "bg-blue-600" },
  Facebook: { icon: "logo-facebook", bg: "bg-blue-700" },
  TikTok: { icon: "logo-tiktok", bg: "bg-gray-700" },
  YouTube: { icon: "logo-youtube", bg: "bg-red-500" },
  Reddit: { icon: "logo-reddit", bg: "bg-orange-500" },
  Telegram: { icon: "paper-plane", bg: "bg-sky-500" },
};

function getIcon(platformName) {
  const base = platformName.split(":")[0];
  return PLATFORM_ICONS[base] || { icon: "globe-outline", bg: "bg-gray-700" };
}

function SuccessBar({ successRate }) {
  const barColor =
    successRate >= 80 ? "bg-green-500" : successRate >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <View className="h-1.5 bg-gray-800 rounded-full flex-1 mx-3 overflow-hidden">
      <View className={`h-full ${barColor} rounded-full`} style={{ width: `${successRate}%` }} />
    </View>
  );
}

export default function PlatformBreakdown({ platformStats, maxTotal }) {
  if (!platformStats.length) return null;

  return (
    <View className="bg-gray-900/80 rounded-2xl p-5 border border-gray-800 mb-4">
      <Text className="text-gray-400 text-xs mb-4">PLATFORM PERFORMANCE</Text>
      {platformStats.map((platform) => {
        const { icon, bg } = getIcon(platform.name);
        const baseName = platform.name.split(":")[0];
        const barWidth = maxTotal > 0 ? Math.max((platform.total / maxTotal) * 100, 10) : 10;

        return (
          <View key={platform.name} className="mb-3">
            <View className="flex-row items-center mb-1.5">
              <View className={`w-7 h-7 rounded-full ${bg} items-center justify-center mr-2`}>
                <Ionicons name={icon} size={14} color="#fff" />
              </View>
              <Text className="text-white text-sm font-medium flex-1">{baseName}</Text>
              <Text className="text-gray-400 text-xs">{platform.total} posts</Text>
            </View>
            <View className="flex-row items-center pl-9">
              <View className="h-2 bg-gray-800 rounded-full flex-1 overflow-hidden">
                <View className="h-full flex-row rounded-full overflow-hidden" style={{ width: `${barWidth}%` }}>
                  {platform.success > 0 && (
                    <View
                      className="h-full bg-green-500"
                      style={{ flex: platform.success }}
                    />
                  )}
                  {platform.failed > 0 && (
                    <View
                      className="h-full bg-red-500"
                      style={{ flex: platform.failed }}
                    />
                  )}
                </View>
              </View>
              <Text className="text-gray-500 text-[10px] ml-2 w-10 text-right">
                {platform.successRate}%
              </Text>
            </View>
          </View>
        );
      })}
      <View className="flex-row items-center justify-end mt-2 pt-2 border-t border-gray-800/60">
        <View className="flex-row items-center mr-4">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
          <Text className="text-gray-500 text-[10px]">Success</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
          <Text className="text-gray-500 text-[10px]">Failed</Text>
        </View>
      </View>
    </View>
  );
}
