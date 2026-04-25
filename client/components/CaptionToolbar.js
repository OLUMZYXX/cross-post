import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function ToolbarButton({ icon, label, color, bgClass, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center ${bgClass} rounded-full px-3 py-2 mr-2`}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text style={{ color }} className="text-[10px] font-semibold ml-1.5">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CaptionToolbar({
  onMedia,
  onFont,
  onRephrase,
  onCopy,
  onDraft,
  captionLength,
  disabled,
}) {
  return (
    <View className="flex-row items-center px-3 py-2.5 border-t border-gray-800/30">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-1"
      >
        <ToolbarButton
          icon="image-outline"
          label="Media"
          color="#4ade80"
          bgClass="bg-green-500/10"
          onPress={onMedia}
          disabled={disabled}
        />
        <ToolbarButton
          icon="text"
          label="Font"
          color="#ec4899"
          bgClass="bg-pink-500/10"
          onPress={onFont}
          disabled={disabled}
        />
        <ToolbarButton
          icon="sparkles"
          label="AI Rephrase"
          color="#a855f7"
          bgClass="bg-purple-500/10"
          onPress={onRephrase}
          disabled={disabled}
        />
        <ToolbarButton
          icon="copy-outline"
          label="Copy"
          color="#f59e0b"
          bgClass="bg-amber-500/10"
          onPress={onCopy}
          disabled={disabled}
        />
        <ToolbarButton
          icon="bookmark-outline"
          label="Draft"
          color="#60a5fa"
          bgClass="bg-blue-500/10"
          onPress={onDraft}
          disabled={disabled}
        />
      </ScrollView>
      <Text className="text-gray-700 text-[10px] ml-2">{captionLength}</Text>
    </View>
  );
}
