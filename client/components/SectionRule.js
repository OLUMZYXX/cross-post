import { View, Text } from "react-native";

export default function SectionRule({ label, accent = false, className = "" }) {
  const textClass = accent
    ? "text-terracotta font-sans-bold text-[10px] tracking-[2px] mr-3"
    : "text-ink font-sans-semibold text-[10px] tracking-[2px] mr-3";

  return (
    <View className={`flex-row items-center ${className}`}>
      <Text className={textClass}>{label}</Text>
      <View className="flex-1 h-px bg-rule" />
    </View>
  );
}
