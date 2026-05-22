import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONT_OPTIONS, applyFont } from "../utils/unicodeFonts";
import { COLORS } from "../constants/theme";

export default function FontPicker({ caption, onChange, onClose }) {
  const handleSelect = (key) => {
    onChange(applyFont(caption, key));
  };

  return (
    <View
      className="border-t border-rule px-3 py-3"
      style={{ backgroundColor: COLORS.paperLight }}
    >
      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-ink-muted font-sans-bold text-[10px] tracking-[2px]">
          FONT STYLE
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={16} color={COLORS.inkMuted} />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {FONT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => handleSelect(opt.key)}
            activeOpacity={0.8}
            style={{
              backgroundColor: COLORS.paper,
              borderWidth: 1,
              borderColor: COLORS.rule,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginRight: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: COLORS.ink, fontSize: 16 }}>{opt.preview}</Text>
            <Text
              style={{
                color: COLORS.inkMuted,
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
