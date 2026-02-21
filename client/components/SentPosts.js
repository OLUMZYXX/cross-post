import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { postAPI } from "../services/api";
import { useToast } from "./Toast";

export default function SentPosts({
  posts,
  refreshing,
  onRefresh,
  onDeletePost,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [retryingMap, setRetryingMap] = useState({});
  const { showToast } = useToast();

  const allPlatforms = {
    Twitter: { icon: "logo-twitter", color: "#1DA1F2" },
    Instagram: { icon: "logo-instagram", color: "#E4405F" },
    LinkedIn: { icon: "logo-linkedin", color: "#0A66C2" },
    Facebook: { icon: "logo-facebook", color: "#1877F2" },
    TikTok: { icon: "logo-tiktok", color: "#fff" },
    YouTube: { icon: "logo-youtube", color: "#FF0000" },
    Reddit: { icon: "logo-reddit", color: "#FF4500" },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const handleDelete = (post) => {
    Alert.alert(
      "Delete Post",
      "This post has already been published. Are you sure you want to remove it from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(post._id || post.id);
            try {
              await onDeletePost(post._id || post.id);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const handleRetry = async (post, platformName) => {
    const postId = post._id || post.id;
    const retryKey = `${postId}-${platformName}`;

    setRetryingMap((prev) => ({ ...prev, [retryKey]: true }));

    try {
      const platformIdentifiers = (post.platforms || []).filter(
        (p) => p.split(":")[0] === platformName,
      );
      if (platformIdentifiers.length === 0) {
        platformIdentifiers.push(platformName);
      }

      const { data } = await postAPI.retry(postId, platformIdentifiers);

      const retryResult = (data.publishResults || []).find(
        (r) => r.platform === platformName,
      );

      if (retryResult?.success) {
        showToast({
          type: "success",
          title: `${platformName} published`,
          message: "Post successfully sent to " + platformName,
        });
      } else {
        showToast({
          type: "error",
          title: `${platformName} failed again`,
          message: retryResult?.error || "Could not publish. Try again later.",
          duration: 5000,
        });
      }

      onRefresh?.();
    } catch (err) {
      showToast({
        type: "error",
        title: "Retry failed",
        message: err.message || "Could not retry. Check your connection.",
        duration: 5000,
      });
    } finally {
      setRetryingMap((prev) => ({ ...prev, [retryKey]: false }));
    }
  };

  const handleRetryAll = async (post) => {
    const postId = post._id || post.id;
    const failedPlatforms = (post.publishResults || [])
      .filter((r) => !r.success)
      .map((r) => r.platform);

    if (failedPlatforms.length === 0) return;

    const platformIdentifiers = [];
    for (const name of failedPlatforms) {
      const matching = (post.platforms || []).filter(
        (p) => p.split(":")[0] === name,
      );
      if (matching.length > 0) {
        platformIdentifiers.push(...matching);
      } else {
        platformIdentifiers.push(name);
      }
    }

    setRetryingMap((prev) => ({ ...prev, [`${postId}-all`]: true }));

    try {
      const { data } = await postAPI.retry(postId, platformIdentifiers);

      const results = data.publishResults || [];
      const succeeded = results.filter((r) => r.success && failedPlatforms.includes(r.platform));
      const stillFailed = results.filter((r) => !r.success && failedPlatforms.includes(r.platform));

      if (stillFailed.length === 0) {
        showToast({
          type: "success",
          title: "All platforms published",
          message: `Successfully sent to ${succeeded.map((r) => r.platform).join(", ")}`,
        });
      } else if (succeeded.length > 0) {
        showToast({
          type: "warning",
          title: "Partially published",
          message: `${succeeded.map((r) => r.platform).join(", ")} succeeded. ${stillFailed.map((r) => r.platform).join(", ")} still failed.`,
          duration: 5000,
        });
      } else {
        showToast({
          type: "error",
          title: "Retry failed",
          message: "Could not publish to any platform. Try again later.",
          duration: 5000,
        });
      }

      onRefresh?.();
    } catch (err) {
      showToast({
        type: "error",
        title: "Retry failed",
        message: err.message || "Could not retry. Check your connection.",
        duration: 5000,
      });
    } finally {
      setRetryingMap((prev) => ({ ...prev, [`${postId}-all`]: false }));
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <>
        <StatusBar style="light" />
        <View className="absolute top-0 left-0 right-0 bottom-0">
          <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/5" />
          <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/5" />
        </View>
        <View className="flex-1 px-6 pt-16">
          <View className="mb-6">
            <Text className="text-gray-400 text-sm">Your Content</Text>
            <Text className="text-white text-2xl font-bold">Sent Posts</Text>
          </View>
          <View className="flex-1 items-center justify-center" style={{ marginTop: -60 }}>
            <View className="w-20 h-20 rounded-full bg-gray-800/80 items-center justify-center mb-5">
              <Ionicons name="paper-plane-outline" size={36} color="#4ade80" />
            </View>
            <Text className="text-white text-lg font-bold mb-2">
              No posts sent yet
            </Text>
            <Text className="text-gray-500 text-sm text-center px-8">
              When you publish posts to your connected platforms, they'll appear
              here.
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/5" />
        <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/5" />
      </View>

      <View className="flex-1 px-6 pt-16">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-gray-400 text-sm">Your Content</Text>
            <Text className="text-white text-2xl font-bold">Sent Posts</Text>
          </View>
          <View className="bg-green-500/20 rounded-full px-3 py-1">
            <Text className="text-green-400 text-xs font-bold">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4ade80"
              colors={["#4ade80"]}
              progressBackgroundColor="#111827"
            />
          }
        >
          {posts.map((post) => {
            const postId = post._id || post.id;
            const isDeleting = deletingId === postId;
            const publishResults = post.publishResults || [];
            const failedResults = publishResults.filter((r) => !r.success);
            const succeededResults = publishResults.filter((r) => r.success);
            const hasFailures = failedResults.length > 0;
            const isRetryingAll = retryingMap[`${postId}-all`];

            return (
              <View
                key={postId}
                className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-4 overflow-hidden"
                style={{ opacity: isDeleting ? 0.5 : 1 }}
              >
                {post.media && post.media.length > 0 ? (
                  <Image
                    source={{ uri: post.media[0] }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-20 bg-gray-800/50 items-center justify-center">
                    <Ionicons name="document-text-outline" size={28} color="#6b7280" />
                  </View>
                )}

                <View className="p-4">
                  <Text className="text-white text-sm mb-3" numberOfLines={3}>
                    {post.caption || "No caption"}
                  </Text>

                  {/* Succeeded platforms */}
                  {succeededResults.length > 0 && (
                    <View className="flex-row flex-wrap mb-2">
                      {succeededResults.map((result, idx) => {
                        const style = allPlatforms[result.platform];
                        return (
                          <View
                            key={`${result.platform}-${idx}`}
                            className="flex-row items-center rounded-full px-2.5 py-1.5 mr-2 mb-1.5 bg-gray-800"
                          >
                            {style && (
                              <Ionicons name={style.icon} size={13} color={style.color} />
                            )}
                            <Text className="text-gray-300 text-xs font-medium ml-1.5">
                              {result.platform}
                            </Text>
                            <Ionicons
                              name="checkmark-circle"
                              size={12}
                              color="#4ade80"
                              style={{ marginLeft: 5 }}
                            />
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Failed platforms with retry */}
                  {hasFailures && (
                    <View className="bg-red-500/5 rounded-xl border border-red-500/15 p-3 mb-3">
                      <View className="flex-row items-center mb-2.5">
                        <Ionicons name="alert-circle" size={14} color="#f87171" />
                        <Text className="text-red-400 text-xs font-semibold ml-1.5">
                          Failed to publish ({failedResults.length})
                        </Text>
                      </View>
                      {failedResults.map((result, idx) => {
                        const style = allPlatforms[result.platform];
                        const retryKey = `${postId}-${result.platform}-${idx}`;
                        const isRetrying = retryingMap[retryKey];

                        return (
                          <View
                            key={`${result.platform}-${idx}`}
                            className="flex-row items-center bg-gray-900/80 rounded-xl px-3 py-2.5 mb-1.5"
                          >
                            <View className="flex-row items-center flex-1">
                              {style && (
                                <View className="w-7 h-7 rounded-lg bg-gray-800 items-center justify-center mr-2.5">
                                  <Ionicons name={style.icon} size={14} color="#f87171" />
                                </View>
                              )}
                              <View className="flex-1 mr-2">
                                <Text className="text-white text-xs font-medium">
                                  {result.platform}
                                </Text>
                                <Text className="text-gray-500 text-[10px] mt-0.5" numberOfLines={1}>
                                  {result.error || "Publishing failed"}
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleRetry(post, result.platform)}
                              disabled={isRetrying || isRetryingAll}
                              className={`flex-row items-center px-3 py-1.5 rounded-lg ${
                                isRetrying || isRetryingAll ? "bg-gray-700" : "bg-red-500/20"
                              }`}
                            >
                              {isRetrying ? (
                                <ActivityIndicator size="small" color="#f87171" />
                              ) : (
                                <>
                                  <Ionicons name="refresh" size={12} color="#f87171" />
                                  <Text className="text-red-400 text-xs font-semibold ml-1">
                                    Retry
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        );
                      })}

                      {failedResults.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleRetryAll(post)}
                          disabled={isRetryingAll}
                          className={`flex-row items-center justify-center py-2.5 rounded-xl mt-1.5 ${
                            isRetryingAll ? "bg-gray-700" : "bg-red-500/15"
                          }`}
                        >
                          {isRetryingAll ? (
                            <ActivityIndicator size="small" color="#f87171" />
                          ) : (
                            <>
                              <Ionicons name="refresh" size={14} color="#f87171" />
                              <Text className="text-red-400 text-xs font-bold ml-1.5">
                                Retry All Failed
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  <View className="flex-row items-center justify-between border-t border-gray-800 pt-3">
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name={hasFailures && succeededResults.length === 0 ? "alert-circle" : "checkmark-circle"}
                        size={14}
                        color={hasFailures && succeededResults.length === 0 ? "#f87171" : "#4ade80"}
                      />
                      <Text className="text-gray-500 text-xs ml-1">
                        {hasFailures && succeededResults.length === 0
                          ? "Publishing failed"
                          : hasFailures
                            ? "Partially published"
                            : `Published ${getTimeAgo(post.publishedAt)}`}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-600 text-xs mr-3">
                        {formatDate(post.publishedAt)} •{" "}
                        {formatTime(post.publishedAt)}
                      </Text>
                      {onDeletePost && (
                        <TouchableOpacity
                          onPress={() => handleDelete(post)}
                          disabled={isDeleting}
                          className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center"
                        >
                          {isDeleting ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                          ) : (
                            <Ionicons
                              name="trash-outline"
                              size={14}
                              color="#ef4444"
                            />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          <View className="h-24" />
        </ScrollView>
      </View>
    </>
  );
}
