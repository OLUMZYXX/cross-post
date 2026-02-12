import { StatusBar } from "expo-status-bar";
import { Text, View, ScrollView, Image, RefreshControl } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export default function SentPosts({ posts, refreshing, onRefresh }) {
  const samplePosts =
    posts?.length > 0
      ? posts
      : [
          {
            id: 1,
            caption:
              "Excited to announce our new product launch! 🚀 Stay tuned for more updates.",
            image: null,
            platforms: ["Twitter", "Instagram", "LinkedIn"],
            date: "Feb 12, 2026",
            time: "2:30 PM",
            likes: 245,
            comments: 32,
          },
          {
            id: 2,
            caption: "Behind the scenes of our latest photoshoot 📸",
            image: null,
            platforms: ["Instagram", "Facebook"],
            date: "Feb 11, 2026",
            time: "10:15 AM",
            likes: 189,
            comments: 18,
          },
          {
            id: 3,
            caption: "Check out our latest blog post on productivity tips!",
            image: null,
            platforms: ["Twitter", "LinkedIn"],
            date: "Feb 10, 2026",
            time: "4:00 PM",
            likes: 78,
            comments: 12,
          },
        ];

  const allPlatforms = {
    Twitter: { icon: "logo-twitter", color: "blue-500" },
    Instagram: { icon: "logo-instagram", color: "pink-500" },
    LinkedIn: { icon: "logo-linkedin", color: "blue-600" },
    Facebook: { icon: "logo-facebook", color: "blue-700" },
    TikTok: { icon: "logo-tiktok", color: "black" },
    YouTube: { icon: "logo-youtube", color: "red-500" },
    Reddit: { icon: "logo-reddit", color: "orange-500" },
  };

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" colors={["#4ade80"]} progressBackgroundColor="#111827" />
          }
        >
          {samplePosts.map((post) => (
            <View
              key={post.id}
              className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-4 overflow-hidden"
            >
              {post.image ? (
                <Image
                  source={{ uri: post.image }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-32 bg-gray-800/50 items-center justify-center">
                  <Text className="text-4xl">📝</Text>
                </View>
              )}

              <View className="p-4">
                <Text className="text-white text-sm mb-3" numberOfLines={2}>
                  {post.caption}
                </Text>

                <View className="flex-row flex-wrap mb-3">
                  {post.platforms.map((platform) => (
                    <View
                      key={platform}
                      className="flex-row items-center bg-gray-800 rounded-full px-2 py-1 mr-2 mb-1"
                    >
                      {allPlatforms[platform] && (
                        <Ionicons
                          name={allPlatforms[platform].icon}
                          size={12}
                          color="#9ca3af"
                        />
                      )}
                      <Text className="text-gray-400 text-xs">{platform}</Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row items-center justify-between border-t border-gray-800 pt-3">
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-xs">
                      📅 {post.date} • {post.time}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="flex-row items-center mr-4">
                      <Ionicons name="heart" size={12} color="#ef4444" />
                      <Text className="text-gray-400 text-xs ml-1">
                        {post.likes}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="chatbubble" size={12} color="#3b82f6" />
                      <Text className="text-gray-400 text-xs ml-1">
                        {post.comments}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <View className="h-24" />
        </ScrollView>
      </View>
    </>
  );
}
