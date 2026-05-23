import { useState } from "react";
import { getColors } from "../constants/theme";
import { View, Text, TouchableOpacity, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FAQ_ITEMS = [
  { q: "How do I connect a social media account?", a: "Go to Home > tap 'Add More' under Connected Platforms, then select the platform you want to connect. You'll be redirected to authorize access." },
  { q: "How do I create and publish a post?", a: "Tap the + button in the bottom nav, write your caption, select platforms, and choose 'Post Now' or 'Schedule for Later'." },
  { q: "Can I edit a published post?", a: "Published posts cannot be edited. You can create a new post with updated content." },
  { q: "How do I disconnect a platform?", a: "Go to Settings > Connected Accounts, then tap 'Disconnect' next to the platform you want to remove." },
  { q: "Is my data secure?", a: "Yes. Your passwords are encrypted and OAuth tokens are stored securely. We never store your social media passwords." },
];

export default function HelpSupport({ onBack }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleFaq = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View className="flex-1 bg-paper px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={getColors().ink} />
        </TouchableOpacity>
        <Text className="text-ink text-xl font-serif-bold">Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-ink-muted text-xs mb-3 ml-1">FAQ</Text>
        <View className="bg-paper-light rounded-2xl border border-rule mb-6">
          {FAQ_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => toggleFaq(i)}
              className={i < FAQ_ITEMS.length - 1 ? "border-b border-rule" : ""}
            >
              <View className="flex-row items-center p-4">
                <Ionicons name="help-circle-outline" size={18} color={getColors().terracotta} />
                <Text className="text-ink text-sm ml-3 flex-1">{item.q}</Text>
                <Ionicons
                  name={expandedIndex === i ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={getColors().inkMuted}
                />
              </View>
              {expandedIndex === i && (
                <View className="px-4 pb-4 pt-0">
                  <Text className="text-ink-muted text-xs leading-5 ml-8">{item.a}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-ink-muted text-xs mb-3 ml-1">CONTACT US</Text>
        <View className="bg-paper-light rounded-2xl border border-rule mb-6">
          <TouchableOpacity
            onPress={() => Linking.openURL("mailto:support@crosspost.app")}
            className="flex-row items-center p-4 border-b border-rule"
          >
            <Ionicons name="mail-outline" size={18} color={getColors().olive} />
            <Text className="text-ink text-sm ml-3 flex-1">Email Support</Text>
            <Text className="text-ink-muted text-xs">support@crosspost.app</Text>
          </TouchableOpacity>
          <View className="flex-row items-center p-4">
            <Ionicons name="information-circle-outline" size={18} color={getColors().inkMuted} />
            <Text className="text-ink text-sm ml-3 flex-1">App Version</Text>
            <Text className="text-ink-muted text-xs">1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
