import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONT_OPTIONS, applyFont } from "../utils/unicodeFonts";
import { useTheme } from "../constants/theme";

export default function FontPicker({ caption, onChange, onClose }) {
  const { colors } = useTheme();
  const handleSelect = (key) => {
    onChange(applyFont(caption, key));
  };

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
        {FONT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => handleSelect(opt.key)}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.paper,
              borderWidth: 1,
              borderColor: colors.rule,
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
                color: colors.inkMuted,
                fontFamily: "HankenGrotesk_500Medium",
                fontSize: 9,
                marginTop: 2,
                letterSpacing: 0.4,
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
