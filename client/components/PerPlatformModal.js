import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { PLATFORM_LIMITS } from "./platformLimits";

const ICONS = {
  Twitter: "logo-twitter",
  Instagram: "logo-instagram",
  Facebook: "logo-facebook",
  LinkedIn: "logo-linkedin",
  TikTok: "musical-notes",
  YouTube: "logo-youtube",
  Reddit: "logo-reddit",
  Telegram: "paper-plane",
};

export default function PerPlatformModal({
  visible,
  onClose,
  captions,
  onChange,
  isTailoring,
  onRegenerate,
}) {
  const colors = getColors();
  const entries = Object.entries(captions || {});

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-1 justify-end bg-ink/60">
          <View className="bg-paper rounded-t-3xl px-6 pt-5 pb-8 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-ink text-xl font-serif-bold">Tailored per platform</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>
            <Text className="text-ink-muted text-xs mb-4">
              Same info, adapted to each platform. Edit anything before you post.
            </Text>

            {isTailoring ? (
              <View className="items-center py-10">
                <ActivityIndicator color={colors.olive} />
                <Text className="text-ink-muted text-xs mt-3">Tailoring for each platform...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {entries.map(([base, text]) => {
                  const limit = PLATFORM_LIMITS[base]?.chars || 1000;
                  const over = (text || "").length > limit;
                  return (
                    <View key={base} className="mb-4">
                      <View className="flex-row items-center justify-between mb-1.5">
                        <View className="flex-row items-center">
                          <Ionicons name={ICONS[base] || "globe-outline"} size={15} color={colors.ink} />
                          <Text className="text-ink font-sans-bold text-sm ml-2">{base}</Text>
                        </View>
                        <Text className={`text-[10px] font-sans-semibold ${over ? "text-terracotta" : "text-ink-soft"}`}>
                          {(text || "").length}/{limit}
                        </Text>
                      </View>
                      <TextInput
                        value={text}
                        onChangeText={(t) => onChange(base, t)}
                        multiline
                        placeholderTextColor={colors.inkSoft}
                        className={`bg-paper-deep border rounded-xl px-4 py-3 text-ink text-sm ${over ? "border-terracotta" : "border-rule"}`}
                        style={{ minHeight: 72, textAlignVertical: "top" }}
                      />
                    </View>
                  );
                })}

                <TouchableOpacity
                  onPress={onRegenerate}
                  className="flex-row items-center justify-center bg-paper-light border border-rule rounded-xl py-3 mb-2"
                >
                  <Ionicons name="refresh" size={16} color={colors.olive} />
                  <Text className="text-ink font-sans-semibold text-sm ml-2">Regenerate</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} className="bg-olive py-3.5 rounded-xl">
                  <Text className="text-paper-light text-center font-sans-bold text-sm">Use these</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
