import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { TIKTOK_PRIVACY_LABELS } from "../constants/tiktok";

export default function TikTokPrivacyPicker({ options, value, brandedContent, onChange }) {
  return (
    <View className="mb-6">
      <Text className="text-ink-muted text-[11px] font-sans-semibold tracking-[1.5px] mb-3">WHO CAN VIEW THIS POST</Text>
      <View className="bg-paper rounded-2xl border border-rule overflow-hidden">
        {options.map((level, index) => {
          const selected = value === level;
          const locked = brandedContent && level === "SELF_ONLY";
          return (
            <TouchableOpacity
              key={level}
              onPress={() => !locked && onChange(level)}
              disabled={locked}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: locked }}
              className={`flex-row items-center px-4 py-3.5 ${index > 0 ? "border-t border-rule" : ""} ${locked ? "opacity-40" : ""}`}
            >
              <View className="flex-1">
                <Text className="text-ink text-sm font-sans-semibold">{TIKTOK_PRIVACY_LABELS[level] || level}</Text>
                {locked ? (
                  <Text className="text-ink-muted text-[11px] mt-0.5">Branded content visibility can't be set to Only me.</Text>
                ) : null}
              </View>
              <Ionicons
                name={selected ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selected ? getColors().terracotta : getColors().inkSoft}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
