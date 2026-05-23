import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/theme";

function ToolbarButton({ icon, label, onPress, disabled, colors }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.paper,
        borderWidth: 1,
        borderColor: colors.rule,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginRight: 8,
      }}
    >
      <Ionicons name={icon} size={13} color={colors.ink} />
      <Text
        style={{
          color: colors.ink,
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
  const { colors } = useTheme();
  return (
    <View
      className="flex-row items-center px-3 py-3 border-t border-rule"
      style={{ backgroundColor: colors.paperLight }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-1"
      >
        <ToolbarButton icon="image-outline" label="Media" onPress={onMedia} disabled={disabled} colors={colors} />
        <ToolbarButton icon="text" label="Font" onPress={onFont} disabled={disabled} colors={colors} />
        <ToolbarButton icon="sparkles-outline" label="Rephrase" onPress={onRephrase} disabled={disabled} colors={colors} />
        <ToolbarButton icon="copy-outline" label="Copy" onPress={onCopy} disabled={disabled} colors={colors} />
        <ToolbarButton icon="bookmark-outline" label="Draft" onPress={onDraft} disabled={disabled} colors={colors} />
      </ScrollView>
      <Text
        style={{
          color: colors.inkMuted,
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
