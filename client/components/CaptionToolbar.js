import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

function ToolbarButton({ icon, label, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.paper,
        borderWidth: 1,
        borderColor: COLORS.rule,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginRight: 8,
      }}
    >
      <Ionicons name={icon} size={13} color={COLORS.ink} />
      <Text
        style={{
          color: COLORS.ink,
          fontFamily: "HankenGrotesk_600SemiBold",
          fontSize: 11,
          marginLeft: 6,
          letterSpacing: 0.2,
        }}
      >
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
    <View
      className="flex-row items-center px-3 py-3 border-t border-rule"
      style={{ backgroundColor: COLORS.paperLight }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-1"
      >
        <ToolbarButton icon="image-outline" label="Media" onPress={onMedia} disabled={disabled} />
        <ToolbarButton icon="text" label="Font" onPress={onFont} disabled={disabled} />
        <ToolbarButton icon="sparkles-outline" label="Rephrase" onPress={onRephrase} disabled={disabled} />
        <ToolbarButton icon="copy-outline" label="Copy" onPress={onCopy} disabled={disabled} />
        <ToolbarButton icon="bookmark-outline" label="Draft" onPress={onDraft} disabled={disabled} />
      </ScrollView>
      <Text
        style={{
          color: COLORS.inkMuted,
          fontFamily: "HankenGrotesk_500Medium",
          fontSize: 11,
          marginLeft: 8,
        }}
      >
        {captionLength}
      </Text>
    </View>
  );
}
