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
  BackHandler,
} from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import TelegramConnectModal from "./TelegramConnectModal";
import CreatePost from "./CreatePost";
import SentPosts from "./SentPosts";
import DraftsScreen from "./DraftsScreen";
import AnalyticsScreen from "./AnalyticsScreen";
import BottomNav from "./BottomNav";
import EditProfile from "./EditProfile";
import ConnectedAccounts from "./ConnectedAccounts";
import NotificationSettings from "./NotificationSettings";
import NotificationsInbox from "./NotificationsInbox";
import PrivacySecurity from "./PrivacySecurity";
import HelpSupport from "./HelpSupport";
import PageLoadingAnimation from "./PageLoadingAnimation";
import { useToast } from "./Toast";
import { postAPI, platformAPI, notificationAPI, clearToken } from "../services/api";

export default function HomePage({
  user,
  onUpdateUser,
  onLogout,
  oauthRefreshKey,
  sharedContent,
  onSharedContentHandled,
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [telegramModalVisible, setTelegramModalVisible] = useState(false);
  const [sentSubTab, setSentSubTab] = useState("published");
  const prevTabRef = useRef(activeTab);

  const fetchPlatforms = useCallback(async () => {
    try {
      const { data } = await platformAPI.list();

      const expandedObjects = [];
      const expandedNames = [];

      const grouped = {};
      for (const p of data.platforms) {
        if (!grouped[p.name]) grouped[p.name] = [];
        grouped[p.name].push(p);
      }

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
        } else if (grouped[p.name].length > 1) {
          const identifier = `${p.name}:${p._id}`;
          expandedObjects.push({
            ...p,
            name: identifier,
          });
          expandedNames.push(identifier);
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

  const [serverDrafts, setServerDrafts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await postAPI.list();
      setAllPosts(data.posts);
      setSentPosts(data.posts.filter((p) => p.status === "published"));
      setServerDrafts(data.posts.filter((p) => p.status === "draft"));
      setScheduledPosts(data.posts.filter((p) => p.status === "scheduled"));
    } catch {}
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationAPI.list();
      setUnreadNotifications(data.unreadCount || 0);
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
          platformNames: post.platforms || [],
        })),
        ...platforms.map((platform) => ({
          id: `platform-${platform._id || platform.name}`,
          type: "platform",
          title: `${platform.name} connected`,
          timestamp: new Date(platform.connectedAt),
          platforms: 1,
          platformNames: [platform.name],
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
    fetchUnreadCount();
  }, [fetchPlatforms, fetchPosts, fetchRecentActivities, fetchUnreadCount]);

  // Re-fetch platforms when OAuth completes (deep link callback) or notification arrives
  useEffect(() => {
    if (oauthRefreshKey > 0) {
      fetchPlatforms();
      fetchRecentActivities();
      fetchUnreadCount();
    }
  }, [oauthRefreshKey, fetchPlatforms, fetchRecentActivities, fetchUnreadCount]);

  useEffect(() => {
    if (sharedContent?.text) {
      setEditingDraft({ caption: sharedContent.text, platforms: [...connectedPlatforms] });
      setShowCreatePost(true);
      onSharedContentHandled?.();
    }
  }, [sharedContent]);

  // Real-time updates every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecentActivities();
      fetchUnreadCount();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchRecentActivities, fetchUnreadCount]);

  // Handle Android back button/gesture
  useEffect(() => {
    const handler = () => {
      // If notifications inbox is open, close it
      if (showNotifications) {
        setShowNotifications(false);
        return true;
      }
      // If create post is open, close it
      if (showCreatePost) {
        setShowCreatePost(false);
        return true;
      }
      // If in a settings sub-screen, go back to settings list
      if (activeTab === "settings" && settingsScreen) {
        setSettingsScreen(null);
        return true;
      }
      // If on a non-home tab, go back to home
      if (activeTab !== "home") {
        prevTabRef.current = "home";
        setActiveTab("home");
        return true;
      }
      // On home tab, let default behavior (exit app)
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handler);
    return () => subscription.remove();
  }, [showCreatePost, showNotifications, activeTab, settingsScreen]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPlatforms(),
        fetchPosts(),
        fetchRecentActivities(),
        fetchUnreadCount(),
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
    Telegram: {
      icon: "paper-plane",
      color: "sky-500",
      bg: "bg-sky-500/20",
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
    return true;
  });

  const getPlatformUsername = (platformName) => {
    const obj = connectedPlatformObjects.find((p) => p.name === platformName);
    return obj?.platformUsername || null;
  };

  const handleTelegramConnected = async () => {
    setTelegramModalVisible(false);
    await fetchPlatforms();
    await fetchRecentActivities();
  };

  const handleConnectPlatform = async (platformName) => {
    if (platformName === "Telegram") {
      setModalVisible(false);
      setTelegramModalVisible(true);
      return;
    }

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

        // Use ephemeral auth session — no cached cookies, user can pick a different account each time
        const result = await WebBrowser.openAuthSessionAsync(
          data.authUrl,
          "crosspost://",
          { preferEphemeralSession: true },
        );

        setModalVisible(false);

        if (result.type === "success" && result.url) {
          const url = result.url;
          const urlObj = new URL(url.replace("crosspost://", "http://dummy.com/"));
          const params = urlObj.searchParams;

          // Facebook with code+state needs server-side exchange
          if (
            platformName === "Facebook" &&
            params.get("code") &&
            params.get("state")
          ) {
            try {
              const res = await platformAPI.completeFacebookAuth(
                params.get("code"),
                params.get("state"),
              );
              if (res?.data?.missingPages) {
                showToast({
                  type: "info",
                  title: `${platformName} connected`,
                  message: "No Facebook Pages found. Create or link a Page to enable publishing.",
                });
              } else {
                showToast({ type: "success", title: `${platformName} connected!` });
              }
            } catch (fbErr) {
              showToast({ type: "error", title: "Connection failed", message: fbErr.message });
            }
            await fetchPlatforms();
            await fetchRecentActivities();
            return;
          }

          if (params.get("success") === "true") {
            showToast({
              type: "success",
              title: `${platformName} connected!`,
              message: params.get("name") ? `@${params.get("name")}` : undefined,
            });
          } else if (params.get("error")) {
            showToast({
              type: "error",
              title: "Connection failed",
              message: params.get("error"),
            });
          }
          await fetchPlatforms();
          await fetchRecentActivities();
        } else if (result.type === "cancel") {
        }
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

  const openServerPost = (post) => {
    setEditingDraft({
      serverId: post._id,
      caption: post.caption || "",
      platforms: post.platforms || [],
      media: (post.media || []).map((url) => ({ uri: url, cloudinaryUrl: url, type: "image" })),
      status: post.status,
      scheduledAt: post.scheduledAt,
    });
    setShowCreatePost(true);
  };

  const handleDeleteServerPost = async (postId) => {
    try {
      await postAPI.delete(postId);
      setServerDrafts((prev) => prev.filter((p) => p._id !== postId));
      setScheduledPosts((prev) => prev.filter((p) => p._id !== postId));
      setAllPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      showToast({ type: "info", title: "Post deleted" });
    } catch (err) {
      showToast({ type: "error", title: "Delete failed", message: err.message });
    }
  };

  const handlePostPublished = (post) => {
    setSentPosts((prev) => [post, ...prev]);
    setServerDrafts((prev) => prev.filter((p) => p._id !== (post._id || post.id)));
    setScheduledPosts((prev) => prev.filter((p) => p._id !== (post._id || post.id)));
    fetchRecentActivities();
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

  if (showNotifications) {
    return (
      <View className="flex-1 bg-gray-950">
        <NotificationsInbox
          onBack={() => {
            setShowNotifications(false);
            fetchUnreadCount();
          }}
          onUnreadCountChange={setUnreadNotifications}
        />
      </View>
    );
  }

  if (activeTab === "sent") {
    const totalDrafts = drafts.length + serverDrafts.length + scheduledPosts.length;
    return (
      <View className="flex-1 bg-gray-950">
        <View className="px-6 pt-16 pb-3">
          <Text className="text-white text-2xl font-bold mb-4">Posts</Text>
          <View className="flex-row bg-gray-900 rounded-xl p-1">
            <TouchableOpacity
              onPress={() => setSentSubTab("published")}
              className={`flex-1 py-2.5 rounded-lg ${sentSubTab === "published" ? "bg-green-500" : ""}`}
            >
              <Text className={`text-center text-sm font-bold ${sentSubTab === "published" ? "text-gray-950" : "text-gray-400"}`}>
                Published ({sentPosts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSentSubTab("drafts")}
              className={`flex-1 py-2.5 rounded-lg ${sentSubTab === "drafts" ? "bg-green-500" : ""}`}
            >
              <Text className={`text-center text-sm font-bold ${sentSubTab === "drafts" ? "text-gray-950" : "text-gray-400"}`}>
                Drafts ({totalDrafts})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {sentSubTab === "published" ? (
          <SentPosts
            posts={sentPosts}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onDeletePost={handleDeletePost}
          />
        ) : (
          <DraftsScreen
            localDrafts={drafts}
            serverDrafts={serverDrafts}
            scheduledPosts={scheduledPosts}
            onOpenDraft={openDraft}
            onOpenServerPost={openServerPost}
            onDeleteLocalDraft={handleDeleteDraft}
            onDeleteServerPost={handleDeleteServerPost}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
    );
  }

  if (activeTab === "analytics") {
    return (
      <AnalyticsScreen
        sentPosts={sentPosts}
        allPosts={allPosts}
        connectedPlatforms={connectedPlatforms}
        refreshing={refreshing}
        onRefresh={onRefresh}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
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
      return <PrivacySecurity onBack={() => setSettingsScreen(null)} user={user} />;
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
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowNotifications(true)}
              className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-3 border border-gray-700"
            >
              <Ionicons name="notifications-outline" size={20} color="#9ca3af" />
              {unreadNotifications > 0 && (
                <View className="absolute -top-1 -right-1 bg-green-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                  <Text className="text-gray-950 text-[10px] font-bold">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700"
            >
              <Text className="text-gray-300 text-sm font-medium">Logout</Text>
            </TouchableOpacity>
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
            <View className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden mb-3">
              {recentActivities.map((activity, index) => {
                const isPost = activity.type === "post";
                const iconName = isPost ? "paper-plane" : "link";
                const iconBg = isPost ? "bg-green-500/20" : "bg-blue-500/20";
                const iconColor = isPost ? "#4ade80" : "#60a5fa";
                const accentColor = isPost ? "text-green-400" : "text-blue-400";

                // Relative time
                const now = new Date();
                const diff = now - activity.timestamp;
                const mins = Math.floor(diff / 60000);
                const hrs = Math.floor(diff / 3600000);
                const days = Math.floor(diff / 86400000);
                let timeLabel;
                if (mins < 1) timeLabel = "Just now";
                else if (mins < 60) timeLabel = `${mins}m ago`;
                else if (hrs < 24) timeLabel = `${hrs}h ago`;
                else if (days < 7) timeLabel = `${days}d ago`;
                else timeLabel = activity.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                return (
                  <View
                    key={activity.id}
                    className={`flex-row items-center px-4 py-3.5 ${index < recentActivities.length - 1 ? "border-b border-gray-800/60" : ""}`}
                  >
                    <View className={`w-9 h-9 rounded-xl ${iconBg} items-center justify-center mr-3`}>
                      <Ionicons name={iconName} size={16} color={iconColor} />
                    </View>
                    <View className="flex-1 mr-2">
                      <Text className="text-white text-sm font-medium" numberOfLines={1}>
                        {activity.title}
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        <Text className={`text-xs font-medium ${accentColor}`}>
                          {isPost ? "Published" : "Connected"}
                        </Text>
                        {activity.platforms > 0 && (
                          <Text className="text-gray-600 text-xs">
                            {" "}· {activity.platforms} platform{activity.platforms !== 1 ? "s" : ""}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text className="text-gray-600 text-xs">{timeLabel}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800 mb-3 items-center">
              <View className="w-12 h-12 rounded-2xl bg-gray-800 items-center justify-center mb-3">
                <Ionicons name="time-outline" size={24} color="#6b7280" />
              </View>
              <Text className="text-white font-medium text-sm mb-1">
                No recent activity
              </Text>
              <Text className="text-gray-500 text-xs text-center">
                Your posts and connections will show up here
              </Text>
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

      <TelegramConnectModal
        visible={telegramModalVisible}
        onClose={() => setTelegramModalVisible(false)}
        onConnected={handleTelegramConnected}
      />

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}
