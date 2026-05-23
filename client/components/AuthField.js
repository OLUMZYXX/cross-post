import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, useTheme } from "../constants/theme";

export default function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  keyboardType,
  autoCapitalize = "sentences",
  autoFocus = false,
  editable = true,
  maxLength,
}) {
  const { colors, resolved } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = focused ? colors.terracotta : colors.rule;
  const isSecure = secure && !revealed;

  return (
    <View className="mb-5">
      <Text className="text-ink-muted text-[10px] font-sans-bold tracking-[2px] mb-1.5">
        {label.toUpperCase()}
      </Text>
      <View
        className="flex-row items-center"
        style={{
          borderBottomWidth: focused ? 2 : 1,
          borderColor,
          marginBottom: focused ? 0 : 1,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkSoft}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
          editable={editable}
          maxLength={maxLength}
          keyboardAppearance={resolved === "dark" ? "dark" : "light"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            color: colors.ink,
            fontFamily: FONTS.sans,
            fontSize: 16,
            paddingVertical: 12,
          }}
        />
        {secure && (
          <TouchableOpacity
            onPress={() => setRevealed((v) => !v)}
            disabled={!editable}
            className="pl-2 py-2"
            activeOpacity={0.6}
          >
            <Ionicons
              name={revealed ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.inkMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
