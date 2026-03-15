import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const PLATFORM_COLORS = {
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  tiktok: "#ff0050",
  youtube: "#FF0000",
  threads: "#ffffff",
  bluesky: "#0085ff",
};

function getPlatformColor(name) {
  const baseName = name.split(":")[0].toLowerCase();
  return PLATFORM_COLORS[baseName] || "#6b7280";
}

function PlatformChip({ name, username, style }) {
  const baseName = name.split(":")[0];
  const color = getPlatformColor(name);

  return (
    <View className="mr-3" style={{ width: 140 }}>
      <LinearGradient
        colors={[`${color}30`, `${color}08`, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-[1px]"
      >
        <View className="bg-gray-950 rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View
              className="w-11 h-11 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Ionicons name={style.icon || "globe-outline"} size={20} color={color} />
            </View>
            <View className="flex-row items-center bg-green-500/15 rounded-full px-2 py-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
              <Text className="text-green-400 text-[9px] font-semibold">Live</Text>
            </View>
          </View>
          <Text className="text-white text-sm font-bold" numberOfLines={1}>
            {username || baseName}
          </Text>
          <Text
            className="text-[11px] font-medium mt-0.5"
            style={{ color: `${color}99` }}
          >
            {baseName}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function EmptyState({ onAddPlatform }) {
  return (
    <TouchableOpacity onPress={onAddPlatform} activeOpacity={0.7} className="mb-2">
      <LinearGradient
        colors={["#4ade8020", "#4ade8008", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-[1px]"
      >
        <View
          className="bg-gray-950 rounded-2xl p-6 items-center"
          style={{ borderWidth: 1, borderColor: "#4ade8020", borderStyle: "dashed" }}
        >
          <View className="w-14 h-14 rounded-2xl bg-green-500/10 items-center justify-center mb-3">
            <Ionicons name="add" size={28} color="#4ade80" />
          </View>
          <Text className="text-white text-sm font-bold">Connect your first platform</Text>
          <Text className="text-gray-500 text-xs mt-1">
            Get started by linking a social account
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function AddButton({ onAddPlatform }) {
  return (
    <TouchableOpacity onPress={onAddPlatform} activeOpacity={0.7}>
      <View
        className="bg-gray-900/50 rounded-2xl p-4 items-center justify-center"
        style={{
          width: 90,
          borderWidth: 1,
          borderColor: "#374151",
          borderStyle: "dashed",
        }}
      >
        <View className="w-11 h-11 rounded-xl bg-gray-800 items-center justify-center mb-2">
          <Ionicons name="add" size={22} color="#4ade80" />
        </View>
        <Text className="text-gray-400 text-[10px] font-medium">Add</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PlatformStrip({
  connectedPlatforms,
  getPlatformStyle,
  getPlatformUsername,
  onAddPlatform,
}) {
  if (connectedPlatforms.length === 0) {
    return <EmptyState onAddPlatform={onAddPlatform} />;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 16 }}
      className="mb-2"
    >
      {connectedPlatforms.map((platform) => (
        <PlatformChip
          key={platform}
          name={platform}
          username={getPlatformUsername(platform)}
          style={getPlatformStyle(platform)}
        />
      ))}
      <AddButton onAddPlatform={onAddPlatform} />
    </ScrollView>
  );
}
