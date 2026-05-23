import { useRef } from "react";
import { Pressable, View, Text, Animated } from "react-native";
import { useTheme } from "../constants/theme";

export default function ChunkyButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  icon = null,
  fullWidth = false,
}) {
  const { colors } = useTheme();
  const palette = getPalette(variant, colors);
  const scale = useRef(new Animated.Value(1)).current;
  const sink = useRef(new Animated.Value(-3)).current;
  const opacity = disabled ? 0.5 : 1;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }),
      Animated.spring(sink, { toValue: -1, useNativeDriver: true, speed: 60, bounciness: 0 }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }),
      Animated.spring(sink, { toValue: -3, useNativeDriver: true, speed: 40, bounciness: 6 }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={{ alignSelf: fullWidth ? "stretch" : "flex-start", opacity }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          style={{
            backgroundColor: palette.shadow,
            borderRadius: 18,
            paddingTop: 3,
          }}
        >
          <Animated.View
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
              transform: [{ translateY: sink }],
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
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function getPalette(variant, colors) {
  if (variant === "primary") {
    return {
      bg: colors.terracotta,
      shadow: colors.terracottaShadow,
      border: colors.terracottaShadow,
      text: "#FFFFFF",
    };
  }
  if (variant === "ink") {
    return {
      bg: colors.ink,
      shadow: "#000",
      border: colors.ink,
      text: colors.paperLight,
    };
  }
  return {
    bg: colors.paperLight,
    shadow: colors.rule,
    border: colors.rule,
    text: colors.ink,
  };
}
