import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BRAND, useTheme } from "../constants/theme";

function PulseBadge({ count, color, paper }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!count) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [count]);

  if (!count) return null;
  return (
    <Animated.View
      style={{
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        paddingHorizontal: 4,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: color,
        transform: [{ scale }],
      }}
    >
      <Text style={{ color: paper, fontSize: 10, fontFamily: "HankenGrotesk_700Bold" }}>
        {count > 9 ? "9+" : count}
      </Text>
    </Animated.View>
  );
}

function NotificationButton({ unread, onPress, colors }) {
  const press = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(press, { toValue: 0.9, useNativeDriver: true, speed: 60, bounciness: 0 }).start()
      }
      onPressOut={() =>
        Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start()
      }
    >
      <Animated.View
        className="w-11 h-11 rounded-full bg-paper-light border border-rule items-center justify-center"
        style={{ transform: [{ scale: press }] }}
      >
        <Ionicons name="notifications-outline" size={20} color={colors.ink} />
        <PulseBadge count={unread} color={colors.terracotta} paper={colors.paperLight} />
      </Animated.View>
    </Pressable>
  );
}

export default function HomeHero({ unreadNotifications, onNotifications }) {
  const { colors } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(lift, { toValue: 0, useNativeDriver: true, tension: 60, friction: 11 }),
    ]).start();
  }, []);

  return (
    <Animated.View
      className="px-5 pt-16 pb-1"
      style={{ opacity: fade, transform: [{ translateY: lift }] }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-baseline">
            <Text className="text-ink font-serif-bold" style={{ fontSize: 36, lineHeight: 42 }}>
              {BRAND.name}
            </Text>
            <Text
              className="text-terracotta font-serif-bold ml-1"
              style={{ fontSize: 36, lineHeight: 42 }}
            >
              {BRAND.dot}
            </Text>
          </View>
          <Text className="text-ink-muted font-sans text-[13px] mt-1 leading-[18px] pr-6">
            {BRAND.tagline}
          </Text>
        </View>

        <NotificationButton
          unread={unreadNotifications}
          onPress={onNotifications}
          colors={colors}
        />
      </View>
    </Animated.View>
  );
}
