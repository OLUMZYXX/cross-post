import { View, TouchableOpacity, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

const TABS = [
  { id: "home", icon: "home-outline", activeIcon: "home", label: "Home" },
  { id: "sent", icon: "paper-plane-outline", activeIcon: "paper-plane", label: "Sent" },
  { id: "analytics", icon: "stats-chart-outline", activeIcon: "stats-chart", label: "Insights" },
  { id: "settings", icon: "person-outline", activeIcon: "person", label: "You" },
];

function NavPill({ tab, isActive, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: isActive ? 0 : 1, alignItems: "center" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 10,
          paddingHorizontal: isActive ? 18 : 14,
          borderRadius: 999,
          backgroundColor: isActive ? COLORS.terracottaSoft : "transparent",
        }}
      >
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={20}
          color={isActive ? COLORS.terracotta : COLORS.inkMuted}
        />
        {isActive && (
          <Text
            style={{
              color: COLORS.terracotta,
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
    </TouchableOpacity>
  );
}

export default function BottomNav({ activeTab, onTabChange }) {
  const shadowProps =
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
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
        backgroundColor: COLORS.paperLight,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: COLORS.rule,
        ...shadowProps,
      }}
    >
      {TABS.map((tab) => (
        <NavPill
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onPress={() => onTabChange(tab.id)}
        />
      ))}
    </View>
  );
}
