import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { getColors, useTheme } from "../constants/theme";
import TeamMembers from "./TeamMembers";
import TeamPerformance from "./TeamPerformance";

const TABS = [
  { id: "members", label: "Members" },
  { id: "performance", label: "Performance" },
];

export default function TeamScreen({ onBack }) {
  const colors = getColors();
  const { resolved } = useTheme();
  const [tab, setTab] = useState("members");

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />
      <View className="flex-1 px-5 pt-14">
        <View className="flex-row items-center mb-5">
          <TouchableOpacity onPress={onBack} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </TouchableOpacity>
          <Text className="text-ink text-2xl font-serif-bold flex-1">Team</Text>
        </View>

        <View className="flex-row bg-paper-deep rounded-2xl p-1 mb-5">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTab(t.id)}
                className={`flex-1 py-2.5 rounded-xl items-center ${active ? "bg-paper-light" : ""}`}
              >
                <Text className={`text-sm font-sans-semibold ${active ? "text-ink" : "text-ink-muted"}`}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {tab === "members" ? <TeamMembers /> : <TeamPerformance />}
        </ScrollView>
      </View>
    </View>
  );
}
