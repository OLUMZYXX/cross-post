import { View, Text, TextInput } from "react-native";
import { FONTS, useTheme } from "../constants/theme";

export default function ComposeCard({
  caption,
  onChangeCaption,
  editable = true,
  children,
}) {
  const { colors, resolved } = useTheme();
  const charCount = caption?.length || 0;

  return (
    <View
      className="bg-paper-light rounded-3xl border border-rule mx-5 mt-5"
      style={{ overflow: "hidden" }}
    >
      <TextInput
        value={caption}
        onChangeText={onChangeCaption}
        placeholder="Say something worth crossing five timelines..."
        placeholderTextColor={colors.inkSoft}
        multiline
        textAlignVertical="top"
        editable={editable}
        keyboardAppearance={resolved === "dark" ? "dark" : "light"}
        style={{
          fontFamily: FONTS.sans,
          fontSize: 16,
          lineHeight: 24,
          color: colors.ink,
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 14,
          minHeight: 120,
        }}
      />

      <View className="px-4">
        <DashedDivider color={colors.rule} />
      </View>

      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-ink-muted font-sans text-[11px] tracking-[1.5px]">
          DRAFT
        </Text>
        <Text className="text-ink-muted font-sans text-[12px]">
          <Text className="font-sans-bold text-ink">{charCount}</Text> characters
        </Text>
      </View>

      {children}
    </View>
  );
}

function DashedDivider({ color }) {
  return (
    <View
      style={{
        height: 1,
        borderTopWidth: 1,
        borderStyle: "dashed",
        borderColor: color,
        marginVertical: 2,
      }}
    />
  );
}
