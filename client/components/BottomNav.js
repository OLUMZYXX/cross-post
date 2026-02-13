import { View, TouchableOpacity, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: "home", icon: "home-outline", activeIcon: "home", label: "Home" },
    { id: "sent", icon: "paper-plane-outline", activeIcon: "paper-plane", label: "Sent" },
    { id: "create", icon: "add", activeIcon: "add", label: "Create", isCenter: true },
    { id: "analytics", icon: "stats-chart-outline", activeIcon: "stats-chart", label: "Analytics" },
    { id: "settings", icon: "settings-outline", activeIcon: "settings", label: "Settings" },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 pb-6 pt-3 px-2">
      <View className="flex-row items-end">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onTabChange(tab.id)}
                style={{ flex: 1, alignItems: "center", marginTop: -28 }}
              >
                <View className="w-14 h-14 rounded-full bg-green-500 items-center justify-center border-4 border-gray-950">
                  <Ionicons name="add" size={28} color="#030712" />
                </View>
                <Text className="text-green-400 mt-1 text-xs">
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? "#4ade80" : "#6b7280"}
              />
              <Text
                className={`mt-1 text-xs ${isActive ? "text-green-400" : "text-gray-500"}`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
