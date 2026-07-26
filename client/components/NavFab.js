import { Pressable, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useSpringScale from "../hooks/useSpringScale";

export default function NavFab({
  onPress,
  colors,
  shadowProps,
  icon = "add",
  iconSize = 30,
  label,
}) {
  const { scale, animateTo } = useSpringScale();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.9)}
      onPressOut={() => animateTo(1, 6)}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          width: 58,
          height: 58,
          borderRadius: 29,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.ink,
          ...shadowProps,
        }}
      >
        <Ionicons name={icon} size={iconSize} color={colors.paper} />
        {label ? (
          <Text
            style={{
              color: colors.paper,
              fontFamily: "HankenGrotesk_700Bold",
              fontSize: 8,
              letterSpacing: 0.3,
              marginTop: 1,
            }}
          >
            {label}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}
