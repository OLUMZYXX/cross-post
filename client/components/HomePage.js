import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, ScrollView, Modal, RefreshControl } from "react-native";
import React, { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import CreatePost from "./CreatePost";
import SentPosts from "./SentPosts";
import BottomNav from "./BottomNav";
import { useToast } from "./Toast";

export default function HomePage({ user, onLogout }) {
  const [showMorePlatforms, setShowMorePlatforms] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [sentPosts, setSentPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([
    "Twitter",
    "Instagram",
    "LinkedIn",
  ]);
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast({ type: "success", title: "Refreshed", message: "Content is up to date.", duration: 2000 });
    }, 1500);
  }, [showToast]);

  const handleTabChange = (tabId) => {
    if (tabId === "create") {
      setShowCreatePost(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const allPlatforms = {
    Twitter: { icon: "logo-twitter", color: "blue-500", bg: "bg-blue-500/20" },
    Instagram: {
      icon: "logo-instagram",
      color: "pink-500",
      bg: "bg-pink-500/20",
    },
    LinkedIn: {
      icon: "logo-linkedin",
      color: "blue-600",
      bg: "bg-blue-600/20",
    },
    Facebook: {
      icon: "logo-facebook",
      color: "blue-700",
      bg: "bg-blue-700/20",
    },
    TikTok: { icon: "logo-tiktok", color: "black", bg: "bg-gray-800" },
    YouTube: { icon: "logo-youtube", color: "red-500", bg: "bg-red-500/20" },
    Reddit: {
      icon: "logo-reddit",
      color: "orange-500",
      bg: "bg-orange-500/20",
    },
  };

  const availablePlatforms = Object.keys(allPlatforms).filter(
    (p) => !connectedPlatforms.includes(p),
  );

  const handleSaveDraft = (draft) => {
    setDrafts((prev) => {
      const exists = prev.findIndex((d) => d.id === draft.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = draft;
        return updated;
      }
      return [draft, ...prev];
    });
  };

  const handleDeleteDraft = (draftId) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    showToast({ type: "info", title: "Draft deleted" });
  };

  const openDraft = (draft) => {
    setEditingDraft(draft);
    setShowCreatePost(true);
  };

  if (showCreatePost) {
    return (
      <CreatePost
        connectedPlatforms={connectedPlatforms}
        allPlatforms={allPlatforms}
        onClose={() => {
          setShowCreatePost(false);
          setEditingDraft(null);
        }}
        onSaveDraft={handleSaveDraft}
        initialDraft={editingDraft}
      />
    );
  }

  if (activeTab === "sent") {
    return (
      <View className="flex-1 bg-gray-950">
        <SentPosts posts={sentPosts} refreshing={refreshing} onRefresh={onRefresh} />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
    );
  }

  if (activeTab === "analytics") {
    return (
      <View className="flex-1 bg-gray-950">
        <StatusBar style="light" />
        <View className="flex-1 px-6 pt-16">
          <View className="mb-6">
            <Text className="text-gray-400 text-sm">Performance</Text>
            <Text className="text-white text-2xl font-bold">Analytics</Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" colors={["#4ade80"]} progressBackgroundColor="#111827" />
            }
          >
            <View className="bg-gray-900/80 rounded-2xl p-5 border border-gray-800 mb-4">
              <Text className="text-gray-400 text-xs mb-3">TOTAL REACH</Text>
              <Text className="text-white text-3xl font-bold">12,450</Text>
              <Text className="text-green-400 text-xs mt-1">+18% this week</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs mb-2">POSTS</Text>
                <Text className="text-white text-xl font-bold">24</Text>
              </View>
              <View className="flex-1 ml-2 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs mb-2">ENGAGEMENT</Text>
                <Text className="text-white text-xl font-bold">8.2%</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs mb-2">LIKES</Text>
                <Text className="text-white text-xl font-bold">512</Text>
              </View>
              <View className="flex-1 ml-2 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs mb-2">COMMENTS</Text>
                <Text className="text-white text-xl font-bold">62</Text>
              </View>
            </View>
          </ScrollView>
        </View>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
    );
  }

  if (activeTab === "settings") {
    return (
      <View className="flex-1 bg-gray-950">
        <StatusBar style="light" />
        <View className="flex-1 px-6 pt-16">
          <View className="mb-6">
            <Text className="text-gray-400 text-sm">Preferences</Text>
            <Text className="text-white text-2xl font-bold">Settings</Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" colors={["#4ade80"]} progressBackgroundColor="#111827" />
            }
          >
            <View className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-4">
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-800">
                <View className="w-9 h-9 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={18} color="#3b82f6" />
                </View>
                <Text className="text-white flex-1 text-sm">Edit Profile</Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-800">
                <View className="w-9 h-9 rounded-full bg-green-500/20 items-center justify-center mr-3">
                  <Ionicons name="link-outline" size={18} color="#22c55e" />
                </View>
                <Text className="text-white flex-1 text-sm">Connected Accounts</Text>
                <Text className="text-gray-500 text-xs mr-2">{connectedPlatforms.length}</Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-4">
                <View className="w-9 h-9 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                  <Ionicons name="notifications-outline" size={18} color="#a855f7" />
                </View>
                <Text className="text-white flex-1 text-sm">Notifications</Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-4">
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-800">
                <View className="w-9 h-9 rounded-full bg-yellow-500/20 items-center justify-center mr-3">
                  <Ionicons name="shield-outline" size={18} color="#eab308" />
                </View>
                <Text className="text-white flex-1 text-sm">Privacy & Security</Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-4">
                <View className="w-9 h-9 rounded-full bg-gray-500/20 items-center justify-center mr-3">
                  <Ionicons name="help-circle-outline" size={18} color="#9ca3af" />
                </View>
                <Text className="text-white flex-1 text-sm">Help & Support</Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={onLogout}
              className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 flex-row items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text className="text-red-400 font-medium text-sm ml-2">Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" colors={["#4ade80"]} progressBackgroundColor="#111827" />
          }
        >
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

          {drafts.length > 0 && (
            <>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-bold">Drafts</Text>
                <View className="bg-yellow-500/20 rounded-full px-2.5 py-0.5">
                  <Text className="text-yellow-400 text-xs font-bold">{drafts.length}</Text>
                </View>
              </View>
              {drafts.map((draft) => (
                <TouchableOpacity
                  key={draft.id}
                  onPress={() => openDraft(draft)}
                  className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-yellow-500/20 items-center justify-center mr-3">
                      <Ionicons name="bookmark" size={18} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-sm font-medium" numberOfLines={1}>
                        {draft.caption || "No caption"}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-0.5">
                        {draft.savedAt} · {draft.platforms?.length || 0} platforms
                        {draft.media?.length > 0 ? " · has media" : ""}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteDraft(draft.id)}
                      className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center ml-2"
                    >
                      <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
              <View className="mb-3" />
            </>
          )}

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
                  className={`w-12 h-12 rounded-full ${allPlatforms[platform].bg} items-center justify-center mb-3`}
                >
                  <Ionicons
                    name={allPlatforms[platform].icon}
                    size={24}
                    color="#fff"
                  />
                </View>
                <Text className="text-white font-bold mb-1">{platform}</Text>
                <Text className="text-green-400 text-xs">Connected</Text>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="w-[48%] bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3"
              style={{ borderStyle: "dashed" }}
            >
              <View className="w-12 h-12 rounded-full bg-gray-700/50 items-center justify-center mb-3">
                <Ionicons name="add" size={24} color="#9ca3af" />
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

          <View className="h-16" />
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
                  showToast({
                    type: "success",
                    title: `${platform} connected`,
                    message: `Your ${platform} account has been linked.`,
                  });
                }}
                className="flex-row items-center mb-3"
              >
                <View
                  className={`w-10 h-10 rounded-full ${allPlatforms[platform].bg} items-center justify-center mr-3`}
                >
                  <Ionicons
                    name={allPlatforms[platform].icon}
                    size={20}
                    color="#fff"
                  />
                </View>
                <Text className="text-white font-medium flex-1">
                  {platform}
                </Text>
                <Ionicons name="add" size={20} color="#22c55e" />
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

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}
