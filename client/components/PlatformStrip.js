import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { getColors } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

const PLATFORM_COLORS = {
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  tiktok: "#ff0050",
  youtube: "#FF0000",
  reddit: "#FF4500",
  telegram: "#0088cc",
  threads: "#ffffff",
  bluesky: "#0085ff",
};

function getPlatformColor(name) {
  const baseName = name.split(":")[0].toLowerCase();
  return PLATFORM_COLORS[baseName] || getColors().inkMuted;
}

function PlatformChip({ name, username, style }) {
  const baseName = name.split(":")[0];
  const color = getPlatformColor(name);

  return (
    <View className="mr-3" style={{ width: 125 }}>
      <View
        className="rounded-2xl p-3.5"
        style={{
          backgroundColor: getColors().paperLight,
          borderWidth: 1,
          borderColor: getColors().rule,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Ionicons name={style.icon || "globe-outline"} size={17} color={color} />
          </View>
          <View
            className="flex-row items-center rounded-full px-2 py-0.5"
            style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
          >
            <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
            <Text className="text-terracotta text-[8px] font-sans-bold">LIVE</Text>
          </View>
        </View>
        <Text className="text-ink text-[13px] font-sans-bold" numberOfLines={1}>
          {username || baseName}
        </Text>
        <Text className="text-[10px] font-sans-semibold mt-0.5" style={{ color: `${color}99` }}>
          {baseName}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ onAddPlatform }) {
  return (
    <TouchableOpacity onPress={onAddPlatform} activeOpacity={0.7} className="mb-2">
      <View
        className="rounded-2xl p-6 items-center"
        style={{
          backgroundColor: getColors().paper,
          borderWidth: 1,
          borderColor: "rgba(34,197,94,0.15)",
          borderStyle: "dashed",
        }}
      >
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: "rgba(34,197,94,0.08)" }}
        >
          <Ionicons name="add" size={28} color={getColors().terracotta} />
        </View>
        <Text className="text-ink text-sm font-sans-bold">Connect your first platform</Text>
        <Text className="text-ink-muted text-xs mt-1">Get started by linking a social account</Text>
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
          width: 75,
          backgroundColor: getColors().paper,
          borderWidth: 1,
          borderColor: getColors().paperDeep,
          borderStyle: "dashed",
        }}
      >
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mb-2"
          style={{ backgroundColor: getColors().paperLight }}
        >
          <Ionicons name="add" size={18} color={getColors().terracotta} />
        </View>
        <Text className="text-ink-muted text-[10px] font-sans-semibold">Add</Text>
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
