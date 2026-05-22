import { View, Text } from "react-native";
import PlatformChip from "./PlatformChip";
import SectionRule from "./SectionRule";

export default function PlatformSelector({
  connectedPlatforms,
  selectedPlatforms,
  onToggle,
  getDisplayName,
  disabled,
}) {
  const selectedCount = selectedPlatforms.length;
  const totalCount = connectedPlatforms.length;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-3">
          <SectionRule label="SEND TO" />
        </View>
        <View className="flex-row items-baseline">
          <Text
            className={`text-[12px] font-sans-bold ${selectedCount > 0 ? "text-terracotta" : "text-ink-muted"}`}
          >
            {selectedCount}
          </Text>
          <Text className="text-ink-muted text-[12px] font-sans">
            /{totalCount}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap">
        {connectedPlatforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform);
          return (
            <PlatformChip
              key={platform}
              name={platform}
              label={getDisplayName(platform)}
              selected={isSelected}
              onPress={() => !disabled && onToggle(platform)}
            />
          );
        })}
      </View>

      {selectedCount === 0 && (
        <Text className="text-terracotta text-[12px] font-sans-medium mt-1 italic">
          Select at least one platform to send.
        </Text>
      )}
    </View>
  );
}
