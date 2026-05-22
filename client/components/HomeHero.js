import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BRAND, COLORS } from "../constants/theme";

export default function HomeHero({ unreadNotifications, onNotifications }) {
  return (
    <View className="px-5 pt-16 pb-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-baseline">
            <Text
              className="text-ink font-serif-bold"
              style={{ fontSize: 36, lineHeight: 42 }}
            >
              {BRAND.name}
            </Text>
            <Text
              className="text-terracotta font-serif-bold ml-1"
              style={{ fontSize: 36, lineHeight: 42 }}
            >
              {BRAND.dot}
            </Text>
          </View>
          <Text className="text-ink-muted font-sans text-[13px] mt-1 leading-[18px] pr-6">
            {BRAND.tagline}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onNotifications}
          className="w-11 h-11 rounded-full bg-paper-light border border-rule items-center justify-center"
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={COLORS.ink}
          />
          {unreadNotifications > 0 && (
            <View className="absolute -top-1 -right-1 bg-terracotta rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
              <Text className="text-paper-light text-[10px] font-sans-bold">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
