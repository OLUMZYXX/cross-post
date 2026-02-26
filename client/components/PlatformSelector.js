import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PLATFORM_HEX = {
  Twitter: "#1DA1F2",
  Instagram: "#E4405F",
  LinkedIn: "#0A66C2",
  Facebook: "#1877F2",
  TikTok: "#ffffff",
  YouTube: "#FF0000",
  Reddit: "#FF4500",
  Telegram: "#0EA5E9",
};

function getHexColor(identifier) {
  const base = identifier.split(":")[0];
  return PLATFORM_HEX[base] || "#9ca3af";
}

function PlatformChip({ platform, isSelected, displayName, icon, onToggle, disabled }) {
  const hexColor = getHexColor(platform);

  return (
    <TouchableOpacity
      onPress={() => onToggle(platform)}
      disabled={disabled}
      activeOpacity={0.7}
      className={`flex-row items-center px-3 py-2.5 rounded-xl mr-2 mb-2 border ${
        isSelected
          ? "border-gray-700 bg-gray-800"
          : "border-gray-800/40 bg-gray-900/50"
      }`}
    >
      <View
        className="w-7 h-7 rounded-lg items-center justify-center mr-2"
        style={{ backgroundColor: isSelected ? hexColor + "20" : "#1f293720" }}
      >
        <Ionicons
          name={icon || "globe-outline"}
          size={14}
          color={isSelected ? hexColor : "#4b5563"}
        />
      </View>
      <Text
        className={`text-xs font-medium mr-1.5 ${isSelected ? "text-white" : "text-gray-600"}`}
        numberOfLines={1}
      >
        {displayName}
      </Text>
      {isSelected && (
        <View
          className="w-4 h-4 rounded-full items-center justify-center ml-auto"
          style={{ backgroundColor: hexColor }}
        >
          <Ionicons name="checkmark" size={10} color="#000" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function PlatformSelector({
  connectedPlatforms,
  selectedPlatforms,
  onToggle,
  getPlatformStyle,
  getDisplayName,
  disabled,
}) {
  const selectedCount = selectedPlatforms.length;
  const totalCount = connectedPlatforms.length;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-gray-500 text-[10px] tracking-wider uppercase">
            Publish to
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className={`text-[11px] font-semibold ${selectedCount > 0 ? "text-green-400" : "text-red-400"}`}>
            {selectedCount}
          </Text>
          <Text className="text-gray-600 text-[11px]">/{totalCount}</Text>
        </View>
      </View>
      <View className="flex-row flex-wrap">
        {connectedPlatforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform);
          const style = getPlatformStyle(platform);
          return (
            <PlatformChip
              key={platform}
              platform={platform}
              isSelected={isSelected}
              displayName={getDisplayName(platform)}
              icon={style.icon}
              onToggle={onToggle}
              disabled={disabled}
            />
          );
        })}
      </View>
      {selectedCount === 0 && (
        <Text className="text-red-400 text-[11px] mt-1">
          Select at least one platform
        </Text>
      )}
    </View>
  );
}
