import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { getColors } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useToast } from "./Toast";
import { formatDate, formatTime, getTimeAgo } from "./sentPostUtils";

export default function SentPostFooter({
  post,
  hasFailures,
  succeededCount,
  onDelete,
  isDeleting,
}) {
  const { showToast } = useToast();
  const allFailed = hasFailures && succeededCount === 0;
  const caption = post.caption || "";

  const handleCopy = async () => {
    if (!caption.trim()) {
      showToast({
        type: "warning",
        title: "Nothing to copy",
        message: "This post has no caption.",
      });
      return;
    }
    try {
      await Clipboard.setStringAsync(caption);
      showToast({
        type: "success",
        title: "Copied!",
        message: "Caption copied to clipboard.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Copy failed",
        message: "Could not copy caption.",
      });
    }
  };

  return (
    <View className="flex-row items-center justify-between pt-3 border-t border-rule">
      <View className="flex-row items-center flex-1">
        <View
          className={`w-5 h-5 rounded-full ${
            allFailed ? "bg-terracotta/15" : "bg-terracotta-soft/30"
          } items-center justify-center mr-1.5`}
        >
          <Ionicons
            name={allFailed ? "close" : "checkmark"}
            size={10}
            color={allFailed ? getColors().terracotta : getColors().terracotta}
          />
        </View>
        <Text className="text-ink-muted text-[10px]">
          {allFailed
            ? "Failed"
            : hasFailures
              ? "Partial"
              : getTimeAgo(post.publishedAt)}
        </Text>
        <Text className="text-ink-soft text-[10px] mx-1.5">·</Text>
        <Text className="text-ink-soft text-[10px]">
          {formatDate(post.publishedAt)} {formatTime(post.publishedAt)}
        </Text>
      </View>

      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleCopy}
          className="w-7 h-7 rounded-lg bg-paper-deep items-center justify-center mr-2"
          activeOpacity={0.7}
        >
          <Ionicons name="copy-outline" size={13} color={getColors().inkMuted} />
        </TouchableOpacity>

        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(post)}
            disabled={isDeleting}
            className="w-7 h-7 rounded-lg bg-paper-deep items-center justify-center"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={getColors().terracotta} />
            ) : (
              <Ionicons name="trash-outline" size={13} color={getColors().inkMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
