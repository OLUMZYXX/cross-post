import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionRule from "./SectionRule";
import PlatformChip from "./PlatformChip";
import { COLORS } from "../constants/theme";

export default function SendToGrid({
  connectedPlatforms,
  selectedPlatforms,
  onTogglePlatform,
  onAddPlatform,
  getPlatformUsername,
}) {
  return (
    <View className="px-5 mt-7">
      <SectionRule label="SEND TO" />

      <View className="flex-row flex-wrap mt-4">
        {connectedPlatforms.map((name) => {
          const selected = selectedPlatforms.includes(name);
          const username = getPlatformUsername?.(name);
          const label = username || name?.split(":")[0] || name;
          return (
            <PlatformChip
              key={name}
              name={name}
              label={label}
              selected={selected}
              onPress={() => onTogglePlatform(name)}
            />
          );
        })}

        <TouchableOpacity
          onPress={onAddPlatform}
          activeOpacity={0.7}
          style={{
            paddingVertical: 9,
            paddingHorizontal: 14,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: COLORS.rule,
            borderStyle: "dashed",
            flexDirection: "row",
            alignItems: "center",
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Ionicons name="add" size={14} color={COLORS.inkMuted} />
          <Text
            style={{
              color: COLORS.inkMuted,
              fontFamily: "HankenGrotesk_600SemiBold",
              fontSize: 13,
              marginLeft: 6,
            }}
          >
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {connectedPlatforms.length === 0 && (
        <Text className="text-ink-muted font-sans text-[12px] italic mt-1 mb-2">
          Connect a platform to start sending posts.
        </Text>
      )}
    </View>
  );
}
