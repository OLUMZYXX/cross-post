import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useState } from "react";
import CreatePost from "./CreatePost";

export default function HomePage({ user, onLogout }) {
  const [showMorePlatforms, setShowMorePlatforms] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState([
    "Twitter",
    "Instagram",
    "LinkedIn",
  ]);

  const allPlatforms = {
    Twitter: { icon: "🐦", color: "blue-500" },
    Instagram: { icon: "📸", color: "pink-500" },
    LinkedIn: { icon: "💼", color: "blue-600" },
    Facebook: { icon: "📘", color: "blue-700" },
    TikTok: { icon: "🎵", color: "black" },
    YouTube: { icon: "📺", color: "red-500" },
    Reddit: { icon: "🟠", color: "orange-500" },
  };

  const availablePlatforms = Object.keys(allPlatforms).filter(
    (p) => !connectedPlatforms.includes(p),
  );

  if (showCreatePost) {
    return (
      <CreatePost
        connectedPlatforms={connectedPlatforms}
        allPlatforms={allPlatforms}
        onClose={() => setShowCreatePost(false)}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/5" />
        <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/5" />
      </View>

      <View className="flex-1 px-6 pt-16">
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-gray-400 text-sm">Welcome back</Text>
            <Text className="text-white text-2xl font-bold">
              {user?.name?.split(" ")[0] || "User"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onLogout}
            className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700"
          >
            <Text className="text-gray-300 text-sm font-medium">Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-gray-900/80 rounded-3xl p-6 border border-gray-800 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold">
                Create New Post
              </Text>
              <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center">
                <Text className="text-xl">✏️</Text>
              </View>
            </View>
            <Text className="text-gray-400 text-sm mb-4">
              Share your content across all connected platforms with one tap.
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreatePost(true)}
              className="bg-green-500 py-3 rounded-xl border border-green-400"
            >
              <Text className="text-gray-950 text-center font-bold">
                + New Post
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-white text-lg font-bold mb-4">
            Connected Platforms
          </Text>

          <View className="flex-row flex-wrap justify-between mb-6">
            {connectedPlatforms.map((platform) => (
              <View
                key={platform}
                className="w-[48%] bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3"
              >
                <View
                  className={`w-12 h-12 rounded-full bg-${allPlatforms[platform].color}/20 items-center justify-center mb-3`}
                >
                  <Text className="text-2xl">
                    {allPlatforms[platform].icon}
                  </Text>
                </View>
                <Text className="text-white font-bold mb-1">{platform}</Text>
                <Text className="text-green-400 text-xs">Connected</Text>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="w-[48%] bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3 border-dashed"
            >
              <View className="w-12 h-12 rounded-full bg-gray-700/50 items-center justify-center mb-3">
                <Text className="text-2xl">➕</Text>
              </View>
              <Text className="text-gray-400 font-bold mb-1">Add More</Text>
              <Text className="text-gray-500 text-xs">Connect platform</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-white text-lg font-bold mb-4">
            Recent Activity
          </Text>

          <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center mr-3">
                <Text className="text-lg">📝</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">
                  Post published successfully
                </Text>
                <Text className="text-gray-500 text-xs">
                  2 hours ago • 3 platforms
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                <Text className="text-lg">🔗</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">
                  Twitter account connected
                </Text>
                <Text className="text-gray-500 text-xs">Yesterday</Text>
              </View>
            </View>
          </View>

          <View className="h-20" />
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-gray-900 rounded-3xl p-6 w-80">
            <Text className="text-white text-lg font-bold mb-4">
              Add Social Media
            </Text>
            {availablePlatforms.map((platform) => (
              <TouchableOpacity
                key={platform}
                onPress={() => {
                  setConnectedPlatforms([...connectedPlatforms, platform]);
                }}
                className="flex-row items-center mb-3"
              >
                <View
                  className={`w-10 h-10 rounded-full bg-${allPlatforms[platform].color}/20 items-center justify-center mr-3`}
                >
                  <Text className="text-xl">{allPlatforms[platform].icon}</Text>
                </View>
                <Text className="text-white font-medium flex-1">
                  {platform}
                </Text>
                <Text className="text-green-400 text-xl">➕</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-gray-800 py-3 rounded-xl mt-4"
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
