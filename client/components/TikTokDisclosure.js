import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { tiktokContentLabel } from "../constants/tiktok";
import TikTokToggleRow from "./TikTokToggleRow";

function CheckRow({ label, description, checked, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-row items-start px-4 py-3 border-t border-rule"
    >
      <Ionicons
        name={checked ? "checkbox" : "square-outline"}
        size={20}
        color={checked ? getColors().terracotta : getColors().inkSoft}
      />
      <View className="flex-1 ml-3">
        <Text className="text-ink text-sm font-sans-semibold">{label}</Text>
        <Text className="text-ink-muted text-[11px] mt-0.5 leading-4">{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TikTokDisclosure({ settings, onChange }) {
  const label = tiktokContentLabel(settings);

  return (
    <View className="mb-6">
      <Text className="text-ink-muted text-[11px] font-sans-semibold tracking-[1.5px] mb-3">CONTENT DISCLOSURE</Text>
      <View className="bg-paper rounded-2xl border border-rule overflow-hidden">
        <TikTokToggleRow
          label="Disclose post content"
          description="Turn on to disclose that this post promotes goods or services in exchange for something of value."
          value={settings.discloseContent}
          onChange={(value) => onChange({ discloseContent: value })}
        />
        {settings.discloseContent ? (
          <>
            <CheckRow
              label="Your brand"
              description="You are promoting yourself or your own business."
              checked={settings.yourBrand}
              onPress={() => onChange({ yourBrand: !settings.yourBrand })}
            />
            <CheckRow
              label="Branded content"
              description="You are promoting another brand or a third party."
              checked={settings.brandedContent}
              onPress={() => onChange({ brandedContent: !settings.brandedContent })}
            />
          </>
        ) : null}
      </View>
      {label ? <Text className="text-ink-muted text-[11px] mt-2 ml-1">{label}</Text> : null}
    </View>
  );
}
