import { View, Text, TouchableOpacity } from "react-native";
import { AUTO_LOCK_OPTIONS } from "../constants/appLock";

export default function AutoLockSelector({ value, onChange, biometricType }) {
  return (
    <View className="mt-4 pt-4 border-t border-rule">
      <Text className="text-ink font-sans-bold text-sm mb-1">Require Unlock</Text>
      <Text className="text-ink-muted text-xs mb-3">
        How long after leaving the app before {biometricType || "biometric"} is
        needed again.
      </Text>
      <View className="flex-row flex-wrap">
        {AUTO_LOCK_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
              className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                selected
                  ? "bg-terracotta border-terracotta"
                  : "bg-paper-deep border-rule"
              }`}
            >
              <Text
                className={`text-xs font-sans-medium ${
                  selected ? "text-paper-light" : "text-ink-muted"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
