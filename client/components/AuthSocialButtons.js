import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/theme";

function SocialPill({ icon, label, onPress, disabled, colors }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={{ marginBottom: 10, opacity: disabled ? 0.6 : 1 }}
    >
      <View
        style={{
          backgroundColor: colors.rule,
          borderRadius: 16,
          paddingTop: 3,
        }}
      >
        <View
          style={{
            backgroundColor: colors.paperLight,
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.rule,
            transform: [{ translateY: -3 }],
          }}
        >
          <Ionicons name={icon} size={18} color={colors.ink} />
          <Text
            style={{
              color: colors.ink,
              fontFamily: "HankenGrotesk_600SemiBold",
              fontSize: 14,
              marginLeft: 10,
              letterSpacing: 0.2,
            }}
          >
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AuthSocialButtons({ onGoogle, onApple, disabled }) {
  const { colors } = useTheme();
  return (
    <View>
      <View className="flex-row items-center mt-7 mb-5">
        <View className="flex-1 h-px bg-rule" />
        <Text className="text-ink-muted text-[10px] font-sans-bold tracking-[2px] mx-3">
          OR CONTINUE WITH
        </Text>
        <View className="flex-1 h-px bg-rule" />
      </View>

      <SocialPill
        icon="logo-google"
        label="Continue with Google"
        onPress={onGoogle}
        disabled={disabled}
        colors={colors}
      />

      {Platform.OS === "ios" && (
        <SocialPill
          icon="logo-apple"
          label="Continue with Apple"
          onPress={onApple}
          disabled={disabled}
          colors={colors}
        />
      )}
    </View>
  );
}
