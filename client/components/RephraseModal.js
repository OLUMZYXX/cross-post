import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TONE_OPTIONS = [
  { key: "professional", label: "Professional", icon: "briefcase-outline", color: "#4F573A" },
  { key: "casual", label: "Casual", icon: "cafe-outline", color: "#B14026" },
  { key: "friendly", label: "Friendly", icon: "heart-outline", color: "#B14026" },
  { key: "witty", label: "Witty", icon: "bulb-outline", color: "#4F573A" },
  { key: "bold", label: "Bold", icon: "flash-outline", color: "#B14026" },
  { key: "inspirational", label: "Inspirational", icon: "sparkles-outline", color: "#4F573A" },
  { key: "genz", label: "Gen Z", icon: "logo-snapchat", color: "#B14026" },
  { key: "sports", label: "Sports", icon: "football-outline", color: "#B14026" },
  { key: "music", label: "Music", icon: "musical-notes-outline", color: "#4F573A" },
  { key: "hype", label: "Hype", icon: "megaphone-outline", color: "#B14026" },
  { key: "storyteller", label: "Storyteller", icon: "book-outline", color: "#4F573A" },
  { key: "sarcastic", label: "Sarcastic", icon: "happy-outline", color: "#B14026" },
];

export default function RephraseModal({
  visible,
  onClose,
  isRephrasing,
  rephrasedText,
  selectedTone,
  onSelectTone,
  onApply,
  hasTwitterSelected,
  onShortenForTwitter,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-ink/60 justify-end">
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View className="bg-paper-light rounded-t-3xl px-6 pt-5 pb-10 border-t border-rule">
            <View className="w-10 h-1 bg-paper-deep rounded-full self-center mb-5" />
            <View className="flex-row items-center mb-5">
              <View className="w-9 h-9 rounded-xl bg-paper-deep items-center justify-center">
                <Ionicons name="sparkles" size={18} color="#4F573A" />
              </View>
              <Text className="text-ink text-lg font-serif-bold ml-3">Rephrase with AI</Text>
            </View>

            <Text className="text-ink-muted text-[10px] tracking-wider mb-3">CHOOSE A TONE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {TONE_OPTIONS.map((tone) => {
                const isActive = selectedTone === tone.key;
                return (
                  <TouchableOpacity
                    key={tone.key}
                    onPress={() => onSelectTone(tone.key)}
                    disabled={isRephrasing}
                    className={`items-center mr-3 px-3 py-2.5 rounded-2xl border ${
                      isActive ? "border-rule bg-paper-deep" : "border-rule bg-paper-deep"
                    }`}
                    style={{ minWidth: 72 }}
                  >
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mb-1.5"
                      style={{ backgroundColor: isActive ? `${tone.color}25` : "#1f293720" }}
                    >
                      <Ionicons name={tone.icon} size={16} color={isActive ? tone.color : "#564B3F"} />
                    </View>
                    <Text className={`text-[10px] font-sans-semibold ${isActive ? "text-olive" : "text-ink-muted"}`}>
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {isRephrasing && (
              <View className="bg-paper-deep rounded-2xl p-6 items-center mb-4">
                <ActivityIndicator color="#4F573A" />
                <Text className="text-ink-muted text-xs mt-3">Rephrasing your post...</Text>
              </View>
            )}

            {rephrasedText && !isRephrasing && (
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-ink-muted text-[10px] tracking-wider">RESULT</Text>
                  <Text className={`text-[10px] font-sans-semibold ${rephrasedText.length > 280 && hasTwitterSelected ? "text-terracotta" : "text-ink-soft"}`}>
                    {rephrasedText.length} chars
                  </Text>
                </View>
                <View className="bg-paper-deep rounded-2xl p-4 border border-rule">
                  <Text className="text-ink text-sm leading-5">{rephrasedText}</Text>
                </View>

                {hasTwitterSelected && rephrasedText.length > 280 && (
                  <TouchableOpacity
                    onPress={onShortenForTwitter}
                    className="flex-row items-center justify-center bg-paper-deep border border-rule py-3 rounded-xl mt-3"
                  >
                    <Ionicons name="logo-twitter" size={16} color="#1DA1F2" />
                    <Text className="text-olive font-sans-bold text-sm ml-2">Shorten for Twitter</Text>
                    <View className="bg-terracotta/20 rounded-full px-2 py-0.5 ml-2">
                      <Text className="text-terracotta text-[10px] font-sans-bold">{rephrasedText.length}/280</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View className="flex-row mt-3">
                  <TouchableOpacity onPress={onApply} className="flex-1 bg-olive py-3.5 rounded-xl mr-2">
                    <Text className="text-paper-light text-center font-sans-bold text-sm">Use This</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onSelectTone(selectedTone)}
                    className="flex-1 bg-paper-deep py-3.5 rounded-xl border border-rule"
                  >
                    <Text className="text-ink text-center font-sans-bold text-sm">Try Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!rephrasedText && !isRephrasing && (
              <View className="bg-paper-deep rounded-2xl p-5 items-center">
                <Ionicons name="sparkles-outline" size={24} color="#736857" />
                <Text className="text-ink-soft text-xs mt-2 text-center">
                  Pick a tone above to rephrase your post
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
