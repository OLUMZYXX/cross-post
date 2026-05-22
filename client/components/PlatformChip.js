import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

const PLATFORM_ICONS = {
  Twitter: "logo-twitter",
  X: "logo-twitter",
  Instagram: "logo-instagram",
  LinkedIn: "logo-linkedin",
  Facebook: "logo-facebook",
  TikTok: "logo-tiktok",
  YouTube: "logo-youtube",
  Reddit: "logo-reddit",
  Telegram: "paper-plane",
  Threads: "at-outline",
};

export default function PlatformChip({
  name,
  label,
  selected,
  onPress,
}) {
  const palette = getPalette(selected);
  const iconName = PLATFORM_ICONS[name?.split(":")[0]] || "ellipse-outline";
  const displayLabel = label || name?.split(":")[0] || name;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ marginRight: 8, marginBottom: 8 }}
    >
      <View
        style={{
          backgroundColor: palette.shadowBg,
          borderRadius: 999,
          paddingBottom: selected ? 2 : 0,
        }}
      >
        <View
          style={{
            backgroundColor: palette.bg,
            borderRadius: 999,
            paddingVertical: 9,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Ionicons name={iconName} size={14} color={palette.icon} />
          <Text
            style={{
              color: palette.text,
              fontFamily: "HankenGrotesk_600SemiBold",
              fontSize: 13,
              marginLeft: 7,
            }}
          >
            {displayLabel}
          </Text>
          {selected && (
            <View style={{ marginLeft: 8 }}>
              <Ionicons name="checkmark" size={14} color={palette.icon} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getPalette(selected) {
  if (selected) {
    return {
      bg: COLORS.ink,
      shadowBg: "#000",
      border: COLORS.ink,
      text: COLORS.paperLight,
      icon: COLORS.paperLight,
    };
  }
  return {
    bg: COLORS.paperLight,
    shadowBg: COLORS.paperLight,
    border: COLORS.rule,
    text: COLORS.ink,
    icon: COLORS.ink,
  };
}
