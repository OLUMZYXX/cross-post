import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";

function formatWhen(info) {
  const date = info?.publishedAt || info?.scheduledAt;
  if (!date) return null;
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatPlatforms(platforms) {
  if (!platforms || platforms.length === 0) return null;
  return platforms.map((p) => p.split(":")[0]).join(", ");
}

export default function DuplicateModal({ visible, onClose, info, onProceed, onEdit }) {
  const when = formatWhen(info);
  const where = formatPlatforms(info?.platforms);
  const verb = info?.status === "scheduled" ? "scheduled" : "posted";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill} className="justify-end">
        <Pressable
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)" }]}
        />
        <View className="bg-paper-light rounded-t-3xl px-6 pt-5 pb-10 border-t border-rule">
          <View className="w-10 h-1 bg-paper-deep rounded-full self-center mb-5" />
          <View className="flex-row items-center mb-5">
            <Ionicons name="copy" size={22} color={getColors().terracotta} />
            <Text className="text-ink text-lg font-serif-bold ml-2">Already Posted</Text>
          </View>

          <View className="bg-terracotta-soft/30 rounded-2xl p-5 border border-terracotta/30 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="alert-circle" size={20} color={getColors().terracotta} />
              <Text className="text-terracotta font-sans-bold text-sm ml-2">
                This news looks like a duplicate
              </Text>
            </View>
            <Text className="text-ink-muted text-xs leading-5">
              {when && where
                ? `The same caption was ${verb} on ${when} to ${where}.`
                : when
                  ? `The same caption was ${verb} on ${when}.`
                  : "The same caption already exists in your posts."}
            </Text>
          </View>

          {info?.captionPreview ? (
            <View className="bg-paper-deep rounded-xl p-3.5 border border-rule mb-4">
              <Text className="text-ink-muted text-xs mb-1 font-sans-semibold">EXISTING POST</Text>
              <Text className="text-ink text-xs" numberOfLines={2}>
                &quot;{info.captionPreview}&quot;
              </Text>
            </View>
          ) : null}

          <View className="flex-row">
            <TouchableOpacity onPress={onEdit} className="flex-1 bg-ink py-3.5 rounded-xl mr-2 items-center">
              <Text className="text-paper-light font-sans-bold text-sm">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onProceed} className="flex-1 bg-paper-deep py-3.5 rounded-xl border border-rule items-center">
              <Text className="text-ink font-sans-bold text-sm">Post Anyway</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
