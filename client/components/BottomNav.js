import { View, TouchableOpacity, Text, Platform } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const TABS = [
  { id: "home", icon: "home-outline", activeIcon: "home", label: "Home" },
  {
    id: "sent",
    icon: "paper-plane-outline",
    activeIcon: "paper-plane",
    label: "Sent",
  },
  {
    id: "create",
    icon: "add",
    activeIcon: "add",
    label: "Create",
    isCenter: true,
  },
  {
    id: "analytics",
    icon: "stats-chart-outline",
    activeIcon: "stats-chart",
    label: "Analytics",
  },
  {
    id: "settings",
    icon: "settings-outline",
    activeIcon: "settings",
    label: "Settings",
  },
];

function NavTab({ tab, isActive, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flex: 1, alignItems: "center", paddingVertical: 2 }}
    >
      <View
        style={{
          width: 40,
          height: 32,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isActive ? "rgba(34,197,94,0.1)" : "transparent",
        }}
      >
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={20}
          color={isActive ? "#4ade80" : "#6b7280"}
        />
      </View>
      <Text
        style={{
          fontSize: 10,
          marginTop: 2,
          fontWeight: isActive ? "600" : "500",
          color: isActive ? "#4ade80" : "#6b7280",
        }}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

function CreateTab({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ flex: 1, alignItems: "center", marginTop: -26 }}
    >
      <LinearGradient
        colors={["#22c55e", "#10b981"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#22c55e",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={26} color="#030712" />
      </LinearGradient>
      <Text
        style={{
          color: "#4ade80",
          marginTop: 4,
          fontSize: 10,
          fontWeight: "600",
        }}
      >
        Create
      </Text>
    </TouchableOpacity>
  );
}

export default function BottomNav({ activeTab, onTabChange }) {
  const Wrapper = Platform.OS === "ios" ? BlurView : View;
  const wrapperProps =
    Platform.OS === "ios" ? { tint: "dark", intensity: 60 } : {};

  return (
    <Wrapper
      {...wrapperProps}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 24,
        paddingTop: 10,
        paddingHorizontal: 8,
        backgroundColor:
          Platform.OS === "ios" ? "transparent" : "rgba(3,7,18,0.97)",
        borderTopWidth: 0.5,
        borderTopColor: "rgba(255,255,255,0.06)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {TABS.map((tab) =>
          tab.isCenter ? (
            <CreateTab key={tab.id} onPress={() => onTabChange(tab.id)} />
          ) : (
            <NavTab
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onPress={() => onTabChange(tab.id)}
            />
          ),
        )}
      </View>
    </Wrapper>
  );
}
