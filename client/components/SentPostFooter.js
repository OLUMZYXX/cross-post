import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
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
    <View className="flex-row items-center justify-between pt-3 border-t border-gray-800/50">
      <View className="flex-row items-center flex-1">
        <View
          className={`w-5 h-5 rounded-full ${
            allFailed ? "bg-red-500/15" : "bg-green-500/15"
          } items-center justify-center mr-1.5`}
        >
          <Ionicons
            name={allFailed ? "close" : "checkmark"}
            size={10}
            color={allFailed ? "#f87171" : "#4ade80"}
          />
        </View>
        <Text className="text-gray-500 text-[10px]">
          {allFailed
            ? "Failed"
            : hasFailures
              ? "Partial"
              : getTimeAgo(post.publishedAt)}
        </Text>
        <Text className="text-gray-700 text-[10px] mx-1.5">·</Text>
        <Text className="text-gray-600 text-[10px]">
          {formatDate(post.publishedAt)} {formatTime(post.publishedAt)}
        </Text>
      </View>

      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleCopy}
          className="w-7 h-7 rounded-lg bg-gray-800/60 items-center justify-center mr-2"
          activeOpacity={0.7}
        >
          <Ionicons name="copy-outline" size={13} color="#9ca3af" />
        </TouchableOpacity>

        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(post)}
            disabled={isDeleting}
            className="w-7 h-7 rounded-lg bg-gray-800/60 items-center justify-center"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={13} color="#6b7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
