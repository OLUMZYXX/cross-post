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

export default function SentPosts({
  posts,
  refreshing,
  onRefresh,
  onDeletePost,
}) {
  const [deletingId, setDeletingId] = useState(null);

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
                  <View className="w-full h-24 bg-gray-800/50 items-center justify-center">
                    <Text className="text-3xl">📝</Text>
                  </View>
                )}

                <View className="p-4">
                  <Text className="text-white text-sm mb-3" numberOfLines={3}>
                    {post.caption || "No caption"}
                  </Text>

                  <View className="flex-row flex-wrap mb-3">
                    {(post.platforms || []).map((platform) => {
                      const baseName = platform.split(":")[0];
                      const result = (post.publishResults || []).find(
                        (r) => r.platform === baseName || r.platform === platform,
                      );
                      const succeeded = result?.success;
                      const failed = result && !result.success;
                      const style = allPlatforms[baseName];

                      return (
                        <View
                          key={platform}
                          className={`flex-row items-center rounded-full px-2.5 py-1 mr-2 mb-1 ${
                            failed
                              ? "bg-red-500/10 border border-red-500/30"
                              : "bg-gray-800"
                          }`}
                        >
                          {style && (
                            <Ionicons
                              name={style.icon}
                              size={12}
                              color={
                                failed
                                  ? "#ef4444"
                                  : style.color
                              }
                            />
                          )}
                          <Text
                            className={`text-xs ml-1 ${
                              failed ? "text-red-400" : "text-gray-400"
                            }`}
                          >
                            {baseName}
                          </Text>
                          {succeeded && (
                            <Ionicons
                              name="checkmark-circle"
                              size={10}
                              color="#4ade80"
                              style={{ marginLeft: 4 }}
                            />
                          )}
                          {failed && (
                            <Ionicons
                              name="close-circle"
                              size={10}
                              color="#ef4444"
                              style={{ marginLeft: 4 }}
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>

                  <View className="flex-row items-center justify-between border-t border-gray-800 pt-3">
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#4ade80"
                      />
                      <Text className="text-gray-500 text-xs ml-1">
                        Published {getTimeAgo(post.publishedAt)}
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
