import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import CreatePost from "./CreatePost";
import SentPosts from "./SentPosts";
import BottomNav from "./BottomNav";
import EditProfile from "./EditProfile";
import ConnectedAccounts from "./ConnectedAccounts";
import NotificationSettings from "./NotificationSettings";
import PrivacySecurity from "./PrivacySecurity";
import HelpSupport from "./HelpSupport";
import PageLoadingAnimation from "./PageLoadingAnimation";
import { useToast } from "./Toast";
import { postAPI, platformAPI, clearToken } from "../services/api";

export default function HomePage({
  user,
  onUpdateUser,
  onLogout,
  oauthRefreshKey,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [sentPosts, setSentPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [connectedPlatformObjects, setConnectedPlatformObjects] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [settingsScreen, setSettingsScreen] = useState(null);
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true);
  const prevTabRef = useRef(activeTab);

  const fetchPlatforms = useCallback(async () => {
    try {
      const { data } = await platformAPI.list();

      // Expand Facebook pages into individual platform entries
      const expandedObjects = [];
      const expandedNames = [];

      for (const p of data.platforms) {
        if (
          p.name === "Facebook" &&
          p.pages &&
          p.pages.length > 0 &&
          p.selectedPageIds &&
          p.selectedPageIds.length > 0
        ) {
          const selectedPages = p.pages.filter((pg) =>
            p.selectedPageIds.includes(pg.pageId),
          );
          for (const page of selectedPages) {
            const identifier = `Facebook:${page.pageId}`;
            expandedObjects.push({
              ...p,
              _id: `${p._id}_page_${page.pageId}`,
              name: identifier,
              platformUsername: page.pageName,
            });
            expandedNames.push(identifier);
          }
        } else {
          expandedObjects.push(p);
          expandedNames.push(p.name);
        }
      }

      setConnectedPlatformObjects(expandedObjects);
      setConnectedPlatforms(expandedNames);
    } catch {
    } finally {
      setLoadingPlatforms(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await postAPI.list();
      setAllPosts(data.posts);
      const published = data.posts.filter((p) => p.status === "published");
      setSentPosts(published);
    } catch {}
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    try {
      // Fetch published posts
      const { data: postsData } = await postAPI.list();
      const publishedPosts = postsData.posts.filter(
        (p) => p.status === "published",
      );

      // Fetch connected platforms
      const { data: platformsData } = await platformAPI.list();
      const platforms = platformsData.platforms;

      // Combine and sort activities
      const activities = [
        ...publishedPosts.map((post) => ({
          id: `post-${post._id || post.id}`,
          type: "post",
          title: post.caption || "Post published",
          timestamp: new Date(post.publishedAt),
          platforms: post.platforms?.length || 0,
          icon: "📝",
        })),
        ...platforms.map((platform) => ({
          id: `platform-${platform._id || platform.name}`,
          type: "platform",
          title: `${platform.name} account connected`,
          timestamp: new Date(platform.connectedAt),
          platforms: 1,
          icon: "🔗",
        })),
      ].sort((a, b) => b.timestamp - a.timestamp);

      setRecentActivities(activities.slice(0, 5)); // Show latest 5 activities
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
    fetchPosts();
    fetchRecentActivities();
  }, [fetchPlatforms, fetchPosts, fetchRecentActivities]);

  // Re-fetch platforms when OAuth completes (deep link callback)
  useEffect(() => {
    if (oauthRefreshKey > 0) {
      fetchPlatforms();
      fetchRecentActivities();
    }
  }, [oauthRefreshKey, fetchPlatforms, fetchRecentActivities]);

  // Real-time updates every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecentActivities();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchRecentActivities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPlatforms(),
        fetchPosts(),
        fetchRecentActivities(),
      ]);
      showToast({
        type: "success",
        title: "Refreshed",
        message: "Content is up to date.",
        duration: 2000,
      });
    } catch {
      showToast({
        type: "error",
        title: "Refresh failed",
        message: "Could not refresh data.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [fetchPlatforms, fetchPosts, fetchRecentActivities, showToast]);

  const handleTabChange = (tabId) => {
    if (tabId === "create") {
      setShowCreatePost(true);
    } else {
      // Show loading animation when navigating back to home tab
      if (tabId === "home" && prevTabRef.current !== "home") {
        setShowLoadingAnimation(true);
      }
      prevTabRef.current = tabId;
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

  // Helper: resolve style for any platform identifier (e.g. "Facebook:abc123" -> Facebook style)
  const getPlatformStyle = (identifier) => {
    const baseName = identifier.split(":")[0];
    return allPlatforms[baseName] || allPlatforms[identifier] || {};
  };

  // Exclude platforms that should not be offered in the "Add Social Media" modal
  const EXCLUDED_FROM_ADD = ["LinkedIn", "Reddit"];

  // Check if Facebook is connected (any Facebook:xxx entry)
  const hasFacebook = connectedPlatforms.some((p) => p.startsWith("Facebook"));

  const availablePlatforms = Object.keys(allPlatforms).filter((p) => {
    if (EXCLUDED_FROM_ADD.includes(p)) return false;
    if (p === "Facebook") return !hasFacebook;
    return !connectedPlatforms.includes(p);
  });

  const getPlatformUsername = (platformName) => {
    const obj = connectedPlatformObjects.find((p) => p.name === platformName);
    return obj?.platformUsername || null;
  };

  const handleConnectPlatform = async (platformName) => {
    try {
      const oauthMethods = {
        Facebook: () => platformAPI.initiateFacebookAuth(),
        Twitter: () => platformAPI.initiateTwitterAuth(),
        Instagram: () => platformAPI.initiateInstagramAuth(),
        TikTok: () => platformAPI.initiateTikTokAuth(),
        LinkedIn: () => platformAPI.initiateLinkedInAuth(),
        YouTube: () => platformAPI.initiateYouTubeAuth(),
        Reddit: () => platformAPI.initiateRedditAuth(),
      };

      if (oauthMethods[platformName]) {
        const { data } = await oauthMethods[platformName]();
        await Linking.openURL(data.authUrl);
        setModalVisible(false);
        return;
      }

      await platformAPI.connect(platformName);
      setConnectedPlatforms((prev) => [...prev, platformName]);
      await fetchRecentActivities();
      showToast({
        type: "success",
        title: `${platformName} connected`,
        message: `Your ${platformName} account has been linked.`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Connection failed",
        message: err.message,
      });
    }
  };

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

  const handlePostPublished = (post) => {
    setSentPosts((prev) => [post, ...prev]);
    fetchRecentActivities(); // Refresh activities after publishing
  };

  const handleDeletePost = async (postId) => {
    try {
      await postAPI.delete(postId);
      setSentPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      setAllPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      fetchRecentActivities();
      showToast({
        type: "success",
        title: "Post deleted",
        message: "The post has been removed.",
        duration: 2000,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Delete failed",
        message: err.message || "Could not delete the post.",
      });
      throw err;
    }
  };

  const handleLogout = async () => {
    await clearToken();
    onLogout();
  };

  if (showCreatePost) {
    return (
      <CreatePost
        connectedPlatforms={connectedPlatforms}
        connectedPlatformObjects={connectedPlatformObjects}
        allPlatforms={allPlatforms}
        onClose={() => {
          setShowCreatePost(false);
          setEditingDraft(null);
        }}
        onSaveDraft={handleSaveDraft}
        onPostPublished={handlePostPublished}
        initialDraft={editingDraft}
      />
    );
  }

  if (activeTab === "sent") {
    return (
      <View className="flex-1 bg-gray-950">
        <SentPosts
          posts={sentPosts}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onDeletePost={handleDeletePost}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
    );
  }

  if (activeTab === "analytics") {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const totalReach = sentPosts.reduce(
      (s, p) => s + (p.platforms?.length || 0),
      0,
    );
    const thisWeekPosts = sentPosts.filter(
      (p) => new Date(p.publishedAt) >= weekAgo,
    );
    const lastWeekPosts = sentPosts.filter((p) => {
      const d = new Date(p.publishedAt);
      return d >= twoWeeksAgo && d < weekAgo;
    });
    const growthPercent =
      lastWeekPosts.length > 0
        ? Math.round(
            ((thisWeekPosts.length - lastWeekPosts.length) /
              lastWeekPosts.length) *
              100,
          )
        : thisWeekPosts.length > 0
          ? 100
          : 0;
    const scheduledCount = allPosts.filter(
      (p) => p.status === "scheduled",
    ).length;
    const draftCount = allPosts.filter((p) => p.status === "draft").length;

    const platformCounts = {};
    sentPosts.forEach((p) => {
      (p.platforms || []).forEach((name) => {
        platformCounts[name] = (platformCounts[name] || 0) + 1;
      });
    });

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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4ade80"
                colors={["#4ade80"]}
                progressBackgroundColor="#111827"
              />
            }
          >
            <View className="bg-gray-900/80 rounded-2xl p-5 border border-gray-800 mb-4">
              <Text className="text-gray-400 text-xs mb-3">TOTAL REACH</Text>
              <Text className="text-white text-3xl font-bold">
                {totalReach.toLocaleString()}
              </Text>
              <Text
                className={`text-xs mt-1 ${growthPercent >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {growthPercent >= 0 ? "+" : ""}
                {growthPercent}% this week
              </Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs mb-2">PUBLISHED</Text>
                <Text className="text-white text-xl font-bold">
                  {sentPosts.length}
                </Text>
              </View>
              <View className="flex-1 ml-2 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs mb-2">THIS WEEK</Text>
                <Text className="text-white text-xl font-bold">
                  {thisWeekPosts.length}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs mb-2">SCHEDULED</Text>
                <Text className="text-white text-xl font-bold">
                  {scheduledCount}
                </Text>
              </View>
              <View className="flex-1 ml-2 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs mb-2">DRAFTS</Text>
                <Text className="text-white text-xl font-bold">
                  {draftCount}
                </Text>
              </View>
            </View>

            {Object.keys(platformCounts).length > 0 && (
              <>
                <Text className="text-gray-400 text-xs mb-3 mt-2">
                  POSTS PER PLATFORM
                </Text>
                {Object.entries(platformCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => {
                    const style = getPlatformStyle(name);
                    return (
                      <View
                        key={name}
                        className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-2 flex-row items-center"
                      >
                        <View
                          className={`w-9 h-9 rounded-full ${style.bg || "bg-gray-700"} items-center justify-center mr-3`}
                        >
                          <Ionicons
                            name={style.icon || "globe-outline"}
                            size={18}
                            color="#fff"
                          />
                        </View>
                        <Text className="text-white text-sm font-medium flex-1">
                          {name.split(":")[0]}
                        </Text>
                        <Text className="text-green-400 font-bold">{count}</Text>
                      </View>
                    );
                  })}
              </>
            )}

            <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mt-2">
              <Text className="text-gray-400 text-xs mb-2">
                CONNECTED PLATFORMS
              </Text>
              <Text className="text-white text-xl font-bold">
                {connectedPlatforms.length}
              </Text>
            </View>
          </ScrollView>
        </View>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
    );
  }

  if (activeTab === "settings") {
    if (settingsScreen === "editProfile") {
      return (
        <EditProfile
          user={user}
          onBack={() => setSettingsScreen(null)}
          onUpdateUser={onUpdateUser}
        />
      );
    }
    if (settingsScreen === "connectedAccounts") {
      return (
        <ConnectedAccounts
          onBack={() => {
            setSettingsScreen(null);
            fetchPlatforms();
          }}
          onOpenConnectModal={() => {
            setSettingsScreen(null);
            setModalVisible(true);
          }}
        />
      );
    }
    if (settingsScreen === "notifications") {
      return <NotificationSettings onBack={() => setSettingsScreen(null)} />;
    }
    if (settingsScreen === "privacy") {
      return <PrivacySecurity onBack={() => setSettingsScreen(null)} />;
    }
    if (settingsScreen === "help") {
      return <HelpSupport onBack={() => setSettingsScreen(null)} />;
    }

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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4ade80"
                colors={["#4ade80"]}
                progressBackgroundColor="#111827"
              />
            }
          >
            <View className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-4">
              <TouchableOpacity
                onPress={() => setSettingsScreen("editProfile")}
                className="flex-row items-center p-4 border-b border-gray-800"
              >
                <View className="w-9 h-9 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={18} color="#3b82f6" />
                </View>
                <Text className="text-white flex-1 text-sm">Edit Profile</Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSettingsScreen("connectedAccounts")}
                className="flex-row items-center p-4 border-b border-gray-800"
              >
                <View className="w-9 h-9 rounded-full bg-green-500/20 items-center justify-center mr-3">
                  <Ionicons name="link-outline" size={18} color="#22c55e" />
                </View>
                <Text className="text-white flex-1 text-sm">
                  Connected Accounts
                </Text>
                <Text className="text-gray-500 text-xs mr-2">
                  {connectedPlatforms.length}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSettingsScreen("notifications")}
                className="flex-row items-center p-4"
              >
                <View className="w-9 h-9 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color="#a855f7"
                  />
                </View>
                <Text className="text-white flex-1 text-sm">Notifications</Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-4">
              <TouchableOpacity
                onPress={() => setSettingsScreen("privacy")}
                className="flex-row items-center p-4 border-b border-gray-800"
              >
                <View className="w-9 h-9 rounded-full bg-yellow-500/20 items-center justify-center mr-3">
                  <Ionicons name="shield-outline" size={18} color="#eab308" />
                </View>
                <Text className="text-white flex-1 text-sm">
                  Privacy & Security
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSettingsScreen("help")}
                className="flex-row items-center p-4"
              >
                <View className="w-9 h-9 rounded-full bg-gray-500/20 items-center justify-center mr-3">
                  <Ionicons
                    name="help-circle-outline"
                    size={18}
                    color="#9ca3af"
                  />
                </View>
                <Text className="text-white flex-1 text-sm">
                  Help & Support
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 flex-row items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text className="text-red-400 font-medium text-sm ml-2">
                Log Out
              </Text>
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

      {showLoadingAnimation && (
        <PageLoadingAnimation
          onFinish={() => setShowLoadingAnimation(false)}
        />
      )}

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
            onPress={handleLogout}
            className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700"
          >
            <Text className="text-gray-300 text-sm font-medium">Logout</Text>
          </TouchableOpacity>
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
                  <Text className="text-yellow-400 text-xs font-bold">
                    {drafts.length}
                  </Text>
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
                      <Text
                        className="text-white text-sm font-medium"
                        numberOfLines={1}
                      >
                        {draft.caption || "No caption"}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-0.5">
                        {draft.savedAt} · {draft.platforms?.length || 0}{" "}
                        platforms
                        {draft.media?.length > 0 ? " · has media" : ""}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteDraft(draft.id)}
                      className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center ml-2"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#ef4444"
                      />
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

          {loadingPlatforms ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#4ade80" />
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between mb-6">
              {connectedPlatforms.map((platform) => {
                const username = getPlatformUsername(platform);
                const style = getPlatformStyle(platform);
                const baseName = platform.split(":")[0];
                return (
                  <View
                    key={platform}
                    className="w-[48%] bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3"
                  >
                    <View
                      className={`w-12 h-12 rounded-full ${style.bg || "bg-gray-700"} items-center justify-center mb-3`}
                    >
                      <Ionicons
                        name={style.icon || "globe-outline"}
                        size={24}
                        color="#fff"
                      />
                    </View>
                    <Text
                      className="text-white font-bold mb-1"
                      numberOfLines={1}
                    >
                      {username || baseName}
                    </Text>
                    <Text className="text-green-400 text-xs">{baseName}</Text>
                  </View>
                );
              })}

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
          )}

          <Text className="text-white text-lg font-bold mb-4">
            Recent Activity
          </Text>

          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <View
                key={activity.id}
                className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center mr-3">
                    <Text className="text-lg">{activity.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium" numberOfLines={1}>
                      {activity.title}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {activity.timestamp.toLocaleDateString()} •{" "}
                      {activity.platforms} platform
                      {activity.platforms !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-500/20 items-center justify-center mr-3">
                  <Text className="text-lg">📅</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium">
                    No recent activity
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    Your activities will appear here
                  </Text>
                </View>
              </View>
            </View>
          )}

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
                onPress={() => handleConnectPlatform(platform)}
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
