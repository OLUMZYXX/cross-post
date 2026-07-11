import { useRef } from "react";
import {
  View,
  Pressable,
  Text,
  Platform,
  Animated,
  StyleSheet,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HOME_TAB = { id: "home", icon: "home-outline", activeIcon: "home", label: "Home" };
const FEED_TAB = { id: "feed", icon: "newspaper-outline", activeIcon: "newspaper", label: "Feed" };
const BASE_TABS = [
  { id: "sent", icon: "paper-plane-outline", activeIcon: "paper-plane", label: "Sent" },
  { id: "analytics", icon: "stats-chart-outline", activeIcon: "stats-chart", label: "Stats" },
  { id: "settings", icon: "person-outline", activeIcon: "person", label: "Profile" },
];

const TAB_LAYOUT = {
  duration: 220,
  create: { type: "easeInEaseOut", property: "opacity" },
  update: { type: "easeInEaseOut" },
  delete: { type: "easeInEaseOut", property: "opacity" },
};

function glass(resolved) {
  const dark = resolved === "dark";
  return {
    tint: dark ? "dark" : "light",
    fill: dark ? "rgba(18,22,26,0.28)" : "rgba(255,255,255,0.34)",
    border: dark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.7)",
    activeBg: dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.06)",
    highlight: dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.55)",
  };
}

function useSpringScale() {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue, bounciness = 0) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 50, bounciness }).start();
  return { scale, animateTo };
}

function NavItem({ tab, isActive, onPress, colors, g }) {
  const { scale, animateTo } = useSpringScale();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.92)}
      onPressOut={() => animateTo(1, 6)}
      style={{ flexGrow: isActive ? 0 : 1, flexShrink: 0, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            paddingHorizontal: isActive ? 18 : 12,
            borderRadius: 24,
            overflow: "hidden",
            borderWidth: isActive ? 1 : 0,
            borderColor: g.highlight,
            backgroundColor: isActive ? g.activeBg : "transparent",
          }}
        >
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
            size={21}
            color={isActive ? colors.ink : colors.inkMuted}
          />
          {isActive && (
            <Text
              numberOfLines={1}
              ellipsizeMode="clip"
              style={{
                color: colors.ink,
                fontFamily: "HankenGrotesk_700Bold",
                fontSize: 14,
                marginLeft: 8,
                letterSpacing: 0.2,
                flexShrink: 1,
              }}
            >
              {tab.label}
            </Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function ComposeFab({ onPress, colors, shadowProps }) {
  const { scale, animateTo } = useSpringScale();

  return (
    <Pressable onPress={onPress} onPressIn={() => animateTo(0.9)} onPressOut={() => animateTo(1, 6)}>
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
        <Ionicons name="add" size={30} color={colors.paper} />
      </Animated.View>
    </Pressable>
  );
}

export default function BottomNav({ activeTab, onTabChange, onCompose, isOwner }) {
  const { colors, resolved } = useTheme();
  const g = glass(resolved);
  const tabs = isOwner ? [HOME_TAB, FEED_TAB, ...BASE_TABS] : [HOME_TAB, ...BASE_TABS];

  const handlePress = (tabId) => {
    if (tabId === activeTab) return;
    LayoutAnimation.configureNext(TAB_LAYOUT);
    onTabChange(tabId);
  };

  const shadowProps =
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: resolved === "dark" ? 0.5 : 0.18,
          shadowRadius: 20,
        }
      : { elevation: 12 };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 22,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1, marginRight: 12, borderRadius: 999, ...shadowProps }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 999,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: g.border,
          }}
        >
          {Platform.OS === "ios" ? (
            <BlurView intensity={70} tint={g.tint} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.paperLight }]} />
          )}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: g.fill }]} />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: g.highlight,
            }}
          />

          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", paddingVertical: 7, paddingHorizontal: 8 }}>
            {tabs.map((tab) => (
              <NavItem
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                colors={colors}
                g={g}
                onPress={() => handlePress(tab.id)}
              />
            ))}
          </View>
        </View>
      </View>

      <ComposeFab onPress={onCompose} colors={colors} shadowProps={shadowProps} />
    </View>
  );
}
