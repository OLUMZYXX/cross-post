import { useRef } from "react";
import {
  View,
  Pressable,
  Text,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TABS = [
  { id: "home", icon: "home-outline", activeIcon: "home", label: "Home" },
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

function useSpringScale() {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue, bounciness = 0) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness,
    }).start();
  return { scale, animateTo };
}

function NavItem({ tab, isActive, onPress, colors }) {
  const { scale, animateTo } = useSpringScale();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.92)}
      onPressOut={() => animateTo(1, 6)}
      style={{
        flexGrow: isActive ? 0 : 1,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
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
            backgroundColor: isActive ? colors.paperDeep : "transparent",
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
        <Ionicons name="add" size={30} color={colors.paper} />
      </Animated.View>
    </Pressable>
  );
}

export default function BottomNav({ activeTab, onTabChange, onCompose }) {
  const { colors, resolved } = useTheme();

  const handlePress = (tabId) => {
    if (tabId === activeTab) return;
    LayoutAnimation.configureNext(TAB_LAYOUT);
    onTabChange(tabId);
  };

  const shadowProps =
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: resolved === "dark" ? 0.45 : 0.14,
          shadowRadius: 16,
        }
      : { elevation: 10 };

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
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.paperLight,
          borderRadius: 999,
          paddingVertical: 7,
          paddingHorizontal: 8,
          borderWidth: 1,
          borderColor: colors.rule,
          marginRight: 12,
          ...shadowProps,
        }}
      >
        {TABS.map((tab) => (
          <NavItem
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            colors={colors}
            onPress={() => handlePress(tab.id)}
          />
        ))}
      </View>

      <ComposeFab onPress={onCompose} colors={colors} shadowProps={shadowProps} />
    </View>
  );
}
