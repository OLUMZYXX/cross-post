import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONT_OPTIONS } from "../utils/unicodeFonts";
import { useTheme } from "../constants/theme";

export default function FontPicker({ selected, onSelectFont, onClose }) {
  const { colors } = useTheme();

  return (
    <View
      className="border-t border-rule px-3 py-3"
      style={{ backgroundColor: colors.paperLight }}
    >
      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-ink-muted font-sans-bold text-[10px] tracking-[2px]">
          FONT STYLE
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={16} color={colors.inkMuted} />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {FONT_OPTIONS.map((opt) => {
          const isActive = (selected || "plain") === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => onSelectFont(opt.key)}
              activeOpacity={0.8}
              style={{
                backgroundColor: isActive ? colors.terracottaSoft : colors.paper,
                borderWidth: 1,
                borderColor: isActive ? colors.terracotta : colors.rule,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginRight: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.ink, fontSize: 16 }}>{opt.preview}</Text>
              <Text
                style={{
                  color: isActive ? colors.terracotta : colors.inkMuted,
                  fontFamily: "HankenGrotesk_500Medium",
                  fontSize: 9,
                  marginTop: 2,
                  letterSpacing: 0.4,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
