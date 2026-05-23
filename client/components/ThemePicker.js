import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/theme";

const OPTIONS = [
  { key: "light", label: "Light", icon: "sunny-outline", desc: "Warm paper" },
  { key: "dark", label: "Dark", icon: "moon-outline", desc: "Deep slate" },
  { key: "system", label: "System", icon: "phone-portrait-outline", desc: "Match device" },
];

export default function ThemePicker() {
  const { mode, setTheme, colors } = useTheme();

  return (
    <View className="bg-paper-light rounded-2xl border border-rule overflow-hidden">
      <View className="px-4 pt-4 pb-2 flex-row items-center">
        <Ionicons name="color-palette-outline" size={16} color={colors.terracotta} />
        <Text className="text-terracotta font-sans-bold text-[10px] tracking-[2px] ml-2">
          APPEARANCE
        </Text>
      </View>

      {OPTIONS.map((opt, i) => {
        const isActive = mode === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setTheme(opt.key)}
            activeOpacity={0.7}
            className={`flex-row items-center px-4 py-3 ${i > 0 ? "border-t border-rule" : ""}`}
          >
            <View
              className="w-9 h-9 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: isActive ? colors.terracottaSoft : colors.paper }}
            >
              <Ionicons
                name={opt.icon}
                size={18}
                color={isActive ? colors.terracotta : colors.ink}
              />
            </View>
            <View className="flex-1">
              <Text className="text-ink font-sans-bold text-[14px]">{opt.label}</Text>
              <Text className="text-ink-muted font-sans text-[11px] mt-0.5">
                {opt.desc}
              </Text>
            </View>
            <View
              className="w-5 h-5 rounded-full border items-center justify-center"
              style={{ borderColor: isActive ? colors.terracotta : colors.rule }}
            >
              {isActive && (
                <View
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors.terracotta }}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
