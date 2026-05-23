import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PlatformChip from "./PlatformChip";
import SectionRule from "./SectionRule";
import { useTheme } from "../constants/theme";

export default function PlatformSelector({
  connectedPlatforms,
  selectedPlatforms,
  onToggle,
  getDisplayName,
  onAddPlatform,
  disabled,
}) {
  const { colors } = useTheme();
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

        {onAddPlatform && (
          <TouchableOpacity
            onPress={onAddPlatform}
            disabled={disabled}
            activeOpacity={0.75}
            style={{
              paddingVertical: 9,
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.rule,
              borderStyle: "dashed",
              flexDirection: "row",
              alignItems: "center",
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Ionicons name="add" size={14} color={colors.terracotta} />
            <Text
              style={{
                color: colors.terracotta,
                fontFamily: "HankenGrotesk_700Bold",
                fontSize: 13,
                marginLeft: 6,
              }}
            >
              Add
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {totalCount === 0 && (
        <Text className="text-ink-muted text-[12px] font-sans italic mt-1">
          Connect a platform with the + button to start sending posts.
        </Text>
      )}

      {totalCount > 0 && selectedCount === 0 && (
        <Text className="text-terracotta text-[12px] font-sans-medium mt-1 italic">
          Select at least one platform to send.
        </Text>
      )}
    </View>
  );
}
