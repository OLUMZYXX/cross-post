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

function timeAgo(info) {
  const date = info?.publishedAt || info?.scheduledAt || info?.createdAt;
  if (!date) return null;
  const mins = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatPlatforms(platforms) {
  if (!platforms || platforms.length === 0) return null;
  return platforms.map((p) => p.split(":")[0]).join(", ");
}

export default function DuplicateModal({ visible, onClose, info, onProceed, onEdit }) {
  const when = timeAgo(info);
  const where = formatPlatforms(info?.platforms);
  const verb = info?.status === "scheduled" ? "scheduled" : "posted";
  const who = info?.postedBy || "someone on your team";
  const match = info?.matchPercent;

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
              <Text className="text-terracotta font-sans-bold text-sm ml-2 flex-1">
                This news was already {verb}
              </Text>
              {match ? (
                <View className="bg-terracotta/15 rounded-full px-2 py-0.5">
                  <Text className="text-terracotta text-[10px] font-sans-bold">{match}% match</Text>
                </View>
              ) : null}
            </View>
            <Text className="text-ink-muted text-xs leading-5">
              {who === "you" ? "You" : who} {verb} very similar news
              {when ? ` ${when}` : ""}
              {where ? ` to ${where}` : ""}. You can still proceed if this is an update.
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
