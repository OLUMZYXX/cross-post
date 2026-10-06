import { View, Text, Switch } from "react-native";
import { getColors } from "../constants/theme";

export default function TikTokToggleRow({ label, description, value, onChange, disabled = false, bordered = false }) {
  return (
    <View className={`flex-row items-center px-4 py-3.5 ${bordered ? "border-t border-rule" : ""} ${disabled ? "opacity-40" : ""}`}>
      <View className="flex-1 pr-3">
        <Text className="text-ink text-sm font-sans-semibold">{label}</Text>
        {description ? <Text className="text-ink-muted text-[11px] mt-0.5 leading-4">{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        accessibilityLabel={label}
        trackColor={{ false: getColors().rule, true: getColors().terracotta }}
        thumbColor={getColors().paperLight}
      />
    </View>
  );
}
