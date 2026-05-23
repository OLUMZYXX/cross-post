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
  { id: "analytics", icon: "stats-chart-outline", activeIcon: "stats-chart", label: "Insights" },
  { id: "settings", icon: "person-outline", activeIcon: "person", label: "You" },
];

const TAB_LAYOUT = {
  duration: 260,
  create: { type: "easeInEaseOut", property: "opacity" },
  update: { type: "spring", springDamping: 0.78 },
  delete: { type: "easeInEaseOut", property: "opacity" },
};

function NavPill({ tab, isActive, onPress, colors }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue, bounciness = 0) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.92)}
      onPressOut={() => animateTo(1, 6)}
      style={{ flex: isActive ? 0 : 1, alignItems: "center" }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 10,
            paddingHorizontal: isActive ? 18 : 14,
            borderRadius: 999,
            backgroundColor: isActive ? colors.terracottaSoft : "transparent",
          }}
        >
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
            size={20}
            color={isActive ? colors.terracotta : colors.inkMuted}
          />
          {isActive && (
            <Text
              style={{
                color: colors.terracotta,
                fontFamily: "HankenGrotesk_700Bold",
                fontSize: 13,
                marginLeft: 8,
                letterSpacing: 0.2,
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

export default function BottomNav({ activeTab, onTabChange }) {
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
          shadowOpacity: resolved === "dark" ? 0.45 : 0.12,
          shadowRadius: 18,
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
        backgroundColor: colors.paperLight,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.rule,
        ...shadowProps,
      }}
    >
      {TABS.map((tab) => (
        <NavPill
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          colors={colors}
          onPress={() => handlePress(tab.id)}
        />
      ))}
    </View>
  );
}
