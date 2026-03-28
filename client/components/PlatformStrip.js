import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    <View className="mr-3" style={{ width: 130 }}>
      <View
        className="rounded-2xl p-3.5"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Ionicons
              name={style.icon || "globe-outline"}
              size={18}
              color={color}
            />
          </View>
          <View
            className="flex-row items-center rounded-full px-2 py-0.5"
            style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
          >
            <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
            <Text className="text-green-400 text-[8px] font-bold">LIVE</Text>
          </View>
        </View>
        <Text className="text-white text-[13px] font-bold" numberOfLines={1}>
          {username || baseName}
        </Text>
        <Text
          className="text-[10px] font-semibold mt-0.5"
          style={{ color: `${color}80` }}
        >
          {baseName}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ onAddPlatform }) {
  return (
    <TouchableOpacity
      onPress={onAddPlatform}
      activeOpacity={0.7}
      className="mb-2"
    >
      <View
        className="rounded-2xl p-6 items-center"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderWidth: 1,
          borderColor: "rgba(34,197,94,0.15)",
          borderStyle: "dashed",
        }}
      >
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: "rgba(34,197,94,0.08)" }}
        >
          <Ionicons name="add" size={28} color="#4ade80" />
        </View>
        <Text className="text-white text-sm font-bold">
          Connect your first platform
        </Text>
        <Text className="text-gray-500 text-xs mt-1">
          Get started by linking a social account
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function AddButton({ onAddPlatform }) {
  return (
    <TouchableOpacity onPress={onAddPlatform} activeOpacity={0.7}>
      <View
        className="rounded-2xl p-3.5 items-center justify-center"
        style={{
          width: 80,
          backgroundColor: "rgba(255,255,255,0.02)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          borderStyle: "dashed",
        }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mb-2"
          style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
        >
          <Ionicons name="add" size={20} color="#4ade80" />
        </View>
        <Text className="text-gray-500 text-[10px] font-semibold">Add</Text>
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
