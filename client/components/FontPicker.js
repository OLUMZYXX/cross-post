import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONT_OPTIONS, applyFont } from "../utils/unicodeFonts";

export default function FontPicker({ caption, onChange, onClose }) {
  const handleSelect = (key) => {
    onChange(applyFont(caption, key));
  };

  return (
    <View className="border-t border-gray-800/30 px-3 py-3">
      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-gray-400 text-[11px] font-semibold tracking-wider">
          FONT STYLE
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {FONT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => handleSelect(opt.key)}
            className="bg-gray-800/70 border border-gray-700/40 rounded-2xl px-4 py-2.5 mr-2 items-center"
          >
            <Text className="text-white text-[16px]">{opt.preview}</Text>
            <Text className="text-gray-500 text-[9px] mt-0.5">{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
