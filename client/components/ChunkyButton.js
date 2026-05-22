import { TouchableOpacity, View, Text } from "react-native";
import { COLORS } from "../constants/theme";

export default function ChunkyButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  icon = null,
  fullWidth = false,
}) {
  const palette = getPalette(variant);
  const opacity = disabled ? 0.5 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={{
        alignSelf: fullWidth ? "stretch" : "flex-start",
        opacity,
      }}
    >
      <View
        style={{
          backgroundColor: palette.shadow,
          borderRadius: 18,
          paddingTop: 3,
        }}
      >
        <View
          style={{
            backgroundColor: palette.bg,
            borderRadius: 16,
            paddingVertical: 14,
            paddingHorizontal: 22,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: palette.border,
            transform: [{ translateY: -3 }],
          }}
        >
          {icon}
          <Text
            style={{
              color: palette.text,
              fontFamily: "HankenGrotesk_700Bold",
              fontSize: 14,
              letterSpacing: 0.3,
              marginLeft: icon ? 8 : 0,
            }}
          >
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getPalette(variant) {
  if (variant === "primary") {
    return {
      bg: COLORS.terracotta,
      shadow: COLORS.terracottaShadow,
      border: COLORS.terracottaShadow,
      text: COLORS.paperLight,
    };
  }
  if (variant === "ink") {
    return {
      bg: COLORS.ink,
      shadow: "#000",
      border: COLORS.ink,
      text: COLORS.paperLight,
    };
  }
  return {
    bg: COLORS.paperLight,
    shadow: COLORS.rule,
    border: COLORS.rule,
    text: COLORS.ink,
  };
}
