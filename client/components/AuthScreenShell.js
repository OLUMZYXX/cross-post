import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { BRAND, useTheme } from "../constants/theme";

export default function AuthScreenShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}) {
  const { resolved } = useTheme();

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-16 -left-24 w-60 h-60 rounded-full bg-terracotta-soft/30" />
        <View className="absolute top-80 -right-24 w-72 h-72 rounded-full bg-olive-soft/20" />
        <View className="absolute -bottom-28 left-8 w-80 h-80 rounded-full bg-terracotta-soft/15" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-16">
            <View className="flex-row items-baseline mb-10">
              <Text
                className="text-ink font-serif-bold"
                style={{ fontSize: 32, lineHeight: 36 }}
              >
                {BRAND.name}
              </Text>
              <Text
                className="text-terracotta font-serif-bold ml-1"
                style={{ fontSize: 32, lineHeight: 36 }}
              >
                {BRAND.dot}
              </Text>
            </View>

            {eyebrow && (
              <Text className="text-terracotta text-[10px] font-sans-bold tracking-[2.5px] mb-3">
                {eyebrow}
              </Text>
            )}

            <Text
              className="text-ink font-serif-bold mb-3"
              style={{ fontSize: 30, lineHeight: 36 }}
            >
              {title}
            </Text>

            {subtitle && (
              <Text className="text-ink-muted font-sans text-[14px] leading-[20px] pr-6 mb-8">
                {subtitle}
              </Text>
            )}

            <View>{children}</View>

            {footer && (
              <View className="items-center mt-8">{footer}</View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
