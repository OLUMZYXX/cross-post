import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function PlatformChip({ name, username, style, onPress }) {
  const baseName = name.split(":")[0];
  return (
    <View className="bg-gray-900 rounded-2xl p-3.5 border border-gray-800 mr-3" style={{ width: 130 }}>
      <View className="flex-row items-center mb-2.5">
        <View className={`w-9 h-9 rounded-xl ${style.bg || "bg-gray-700"} items-center justify-center`}>
          <Ionicons name={style.icon || "globe-outline"} size={18} color="#fff" />
        </View>
        <View className="w-2 h-2 rounded-full bg-green-500 absolute top-0 right-0" />
      </View>
      <Text className="text-white text-sm font-bold" numberOfLines={1}>{username || baseName}</Text>
      <Text className="text-gray-500 text-[10px] mt-0.5">{baseName}</Text>
    </View>
  );
}

export default function PlatformStrip({
  connectedPlatforms,
  getPlatformStyle,
  getPlatformUsername,
  onAddPlatform,
}) {
  if (connectedPlatforms.length === 0) {
    return (
      <TouchableOpacity
        onPress={onAddPlatform}
        className="bg-gray-900 rounded-2xl p-5 border border-gray-800 items-center mb-2"
        style={{ borderStyle: "dashed" }}
      >
        <View className="w-12 h-12 rounded-2xl bg-gray-800 items-center justify-center mb-2">
          <Ionicons name="add" size={24} color="#4ade80" />
        </View>
        <Text className="text-white text-sm font-medium">Connect your first platform</Text>
        <Text className="text-gray-500 text-xs mt-1">Get started by linking a social account</Text>
      </TouchableOpacity>
    );
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
      <TouchableOpacity
        onPress={onAddPlatform}
        className="bg-gray-900/50 rounded-2xl p-3.5 border border-gray-800 items-center justify-center"
        style={{ width: 80, borderStyle: "dashed" }}
      >
        <View className="w-9 h-9 rounded-xl bg-gray-800 items-center justify-center mb-1">
          <Ionicons name="add" size={20} color="#6b7280" />
        </View>
        <Text className="text-gray-500 text-[10px]">Add</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
