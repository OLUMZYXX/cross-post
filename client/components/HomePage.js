import {
  Text,
  View,
  TouchableOpacity,
  Modal,
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
import HomeScreen from "./HomeScreen";
import SettingsScreen from "./SettingsScreen";
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

      const activePlatforms = data.platforms.filter((p) => p.active !== false);

      const grouped = {};
      for (const p of activePlatforms) {
        if (!grouped[p.name]) grouped[p.name] = [];
        grouped[p.name].push(p);
      }

      for (const p of activePlatforms) {
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
      const { data: postsData } = await postAPI.list();
      const publishedPosts = postsData.posts.filter(
        (p) => p.status === "published",
      );

      const { data: platformsData } = await platformAPI.list();
      const platforms = platformsData.platforms;

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

      setRecentActivities(activities.slice(0, 5));
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

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecentActivities();
      fetchUnreadCount();
    }, 120000);

    return () => clearInterval(interval);
  }, [fetchRecentActivities, fetchUnreadCount]);

  useEffect(() => {
    const handler = () => {
      if (showNotifications) {
        setShowNotifications(false);
        return true;
      }
      if (showCreatePost) {
        setShowCreatePost(false);
        return true;
      }
      if (activeTab === "settings" && settingsScreen) {
        setSettingsScreen(null);
        return true;
      }
      if (activeTab !== "home") {
        prevTabRef.current = "home";
        setActiveTab("home");
        return true;
      }
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

  const getPlatformStyle = (identifier) => {
    const baseName = identifier.split(":")[0];
    return allPlatforms[baseName] || allPlatforms[identifier] || {};
  };

  const EXCLUDED_FROM_ADD = ["LinkedIn", "Reddit"];

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

  const handleClearAllDrafts = async () => {
    try {
      const serverIds = serverDrafts.map((d) => d._id);
      await Promise.all(serverIds.map((id) => postAPI.delete(id)));
      setServerDrafts([]);
      setDrafts([]);
      setAllPosts((prev) =>
        prev.filter((p) => p.status !== "draft" && !prev.find((d) => d.id === p.id)),
      );
      showToast({ type: "success", title: "All drafts cleared" });
    } catch (err) {
      showToast({ type: "error", title: "Clear failed", message: err.message });
    }
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
        <View className="px-5 pt-14 pb-2">
          <Text className="text-white text-2xl font-bold mb-4">Posts</Text>
          <View className="flex-row bg-gray-900 rounded-xl p-1 border border-gray-800/60">
            <TouchableOpacity
              onPress={() => setSentSubTab("published")}
              className={`flex-1 py-2 rounded-lg ${sentSubTab === "published" ? "bg-green-500" : ""}`}
            >
              <Text className={`text-center text-xs font-bold ${sentSubTab === "published" ? "text-gray-950" : "text-gray-500"}`}>
                Published ({sentPosts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSentSubTab("drafts")}
              className={`flex-1 py-2 rounded-lg ${sentSubTab === "drafts" ? "bg-green-500" : ""}`}
            >
              <Text className={`text-center text-xs font-bold ${sentSubTab === "drafts" ? "text-gray-950" : "text-gray-500"}`}>
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
            onClearAllDrafts={handleClearAllDrafts}
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
        <SettingsScreen
          user={user}
          connectedPlatformsCount={connectedPlatforms.length}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEditProfile={() => setSettingsScreen("editProfile")}
          onConnectedAccounts={() => setSettingsScreen("connectedAccounts")}
          onNotifications={() => setSettingsScreen("notifications")}
          onPrivacy={() => setSettingsScreen("privacy")}
          onHelp={() => setSettingsScreen("help")}
          onLogout={handleLogout}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-950">
      {showLoadingAnimation && (
        <PageLoadingAnimation
          onFinish={() => setShowLoadingAnimation(false)}
        />
      )}

      <HomeScreen
        user={user}
        sentPosts={sentPosts}
        allPosts={allPosts}
        connectedPlatforms={connectedPlatforms}
        connectedPlatformObjects={connectedPlatformObjects}
        loadingPlatforms={loadingPlatforms}
        recentActivities={recentActivities}
        unreadNotifications={unreadNotifications}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onCreatePost={() => setShowCreatePost(true)}
        onNotifications={() => setShowNotifications(true)}
        onAddPlatform={() => setModalVisible(true)}
        getPlatformStyle={getPlatformStyle}
        getPlatformUsername={getPlatformUsername}
      />

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
