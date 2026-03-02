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
  { key: "professional", label: "Professional", icon: "briefcase-outline", color: "#3b82f6" },
  { key: "casual", label: "Casual", icon: "cafe-outline", color: "#f59e0b" },
  { key: "friendly", label: "Friendly", icon: "heart-outline", color: "#ec4899" },
  { key: "witty", label: "Witty", icon: "bulb-outline", color: "#a855f7" },
  { key: "bold", label: "Bold", icon: "flash-outline", color: "#ef4444" },
  { key: "inspirational", label: "Inspirational", icon: "sparkles-outline", color: "#14b8a6" },
  { key: "genz", label: "Gen Z", icon: "logo-snapchat", color: "#facc15" },
  { key: "sports", label: "Sports", icon: "football-outline", color: "#f97316" },
  { key: "music", label: "Music", icon: "musical-notes-outline", color: "#8b5cf6" },
  { key: "hype", label: "Hype", icon: "megaphone-outline", color: "#ef4444" },
  { key: "storyteller", label: "Storyteller", icon: "book-outline", color: "#06b6d4" },
  { key: "sarcastic", label: "Sarcastic", icon: "happy-outline", color: "#f472b6" },
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
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-black/60 justify-end">
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View className="bg-gray-900 rounded-t-3xl px-6 pt-5 pb-10 border-t border-gray-800">
            <View className="w-10 h-1 bg-gray-700 rounded-full self-center mb-5" />
            <View className="flex-row items-center mb-5">
              <View className="w-9 h-9 rounded-xl bg-purple-500/20 items-center justify-center">
                <Ionicons name="sparkles" size={18} color="#a855f7" />
              </View>
              <Text className="text-white text-lg font-bold ml-3">Rephrase with AI</Text>
            </View>

            <Text className="text-gray-500 text-[10px] tracking-wider mb-3">CHOOSE A TONE</Text>
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
                      isActive ? "border-purple-500/50 bg-purple-500/15" : "border-gray-800 bg-gray-800/50"
                    }`}
                    style={{ minWidth: 72 }}
                  >
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mb-1.5"
                      style={{ backgroundColor: isActive ? `${tone.color}25` : "#1f293720" }}
                    >
                      <Ionicons name={tone.icon} size={16} color={isActive ? tone.color : "#6b7280"} />
                    </View>
                    <Text className={`text-[10px] font-semibold ${isActive ? "text-purple-300" : "text-gray-500"}`}>
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {isRephrasing && (
              <View className="bg-gray-800/60 rounded-2xl p-6 items-center mb-4">
                <ActivityIndicator color="#a855f7" />
                <Text className="text-gray-400 text-xs mt-3">Rephrasing your post...</Text>
              </View>
            )}

            {rephrasedText && !isRephrasing && (
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-[10px] tracking-wider">RESULT</Text>
                  <Text className={`text-[10px] font-semibold ${rephrasedText.length > 280 && hasTwitterSelected ? "text-red-400" : "text-gray-600"}`}>
                    {rephrasedText.length} chars
                  </Text>
                </View>
                <View className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
                  <Text className="text-white text-sm leading-5">{rephrasedText}</Text>
                </View>

                {hasTwitterSelected && rephrasedText.length > 280 && (
                  <TouchableOpacity
                    onPress={onShortenForTwitter}
                    className="flex-row items-center justify-center bg-blue-500/15 border border-blue-500/30 py-3 rounded-xl mt-3"
                  >
                    <Ionicons name="logo-twitter" size={16} color="#1DA1F2" />
                    <Text className="text-blue-400 font-bold text-sm ml-2">Shorten for Twitter</Text>
                    <View className="bg-red-500/20 rounded-full px-2 py-0.5 ml-2">
                      <Text className="text-red-400 text-[10px] font-bold">{rephrasedText.length}/280</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View className="flex-row mt-3">
                  <TouchableOpacity onPress={onApply} className="flex-1 bg-purple-500 py-3.5 rounded-xl mr-2">
                    <Text className="text-white text-center font-bold text-sm">Use This</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onSelectTone(selectedTone)}
                    className="flex-1 bg-gray-800 py-3.5 rounded-xl border border-gray-700/50"
                  >
                    <Text className="text-gray-300 text-center font-bold text-sm">Try Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!rephrasedText && !isRephrasing && (
              <View className="bg-gray-800/30 rounded-2xl p-5 items-center">
                <Ionicons name="sparkles-outline" size={24} color="#4b5563" />
                <Text className="text-gray-600 text-xs mt-2 text-center">
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
