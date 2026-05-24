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
        <View className="bg-paper-light rounded-2xl border border-rule px-4 py-4 mt-1 mb-1">
          <Text className="text-ink font-serif-bold text-[14px] mb-1">
            One inbox starts with one connection.
          </Text>
          <Text className="text-ink-muted font-sans text-[12px] leading-[18px]">
            Tap{" "}
            <Text className="text-terracotta font-sans-bold">+ Add</Text>
            {" "}above to link Twitter, Instagram, LinkedIn, TikTok or any of the other platforms Crosspost supports.
          </Text>
        </View>
      )}

      {totalCount > 0 && selectedCount === 0 && (
        <Text className="text-terracotta text-[12px] font-sans-medium mt-1 italic">
          Tap a platform above to send your post there.
        </Text>
      )}
    </View>
  );
}
