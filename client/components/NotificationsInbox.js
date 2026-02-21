import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { notificationAPI } from "../services/api";
import { useToast } from "./Toast";

const typeConfig = {
  post_published: { icon: "checkmark-circle", color: "#4ade80", bg: "#4ade8020" },
  post_failed: { icon: "close-circle", color: "#f87171", bg: "#f8717120" },
  post_partial: { icon: "alert-circle", color: "#f59e0b", bg: "#f59e0b20" },
  post_scheduled: { icon: "time", color: "#3b82f6", bg: "#3b82f620" },
  schedule_reminder: { icon: "alarm", color: "#a855f7", bg: "#a855f720" },
  platform_connected: { icon: "link", color: "#22c55e", bg: "#22c55e20" },
  platform_disconnected: { icon: "unlink", color: "#ef4444", bg: "#ef444420" },
};

export default function NotificationsInbox({ onBack, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationAPI.list();
      setNotifications(data.notifications || []);
      onUnreadCountChange?.(data.unreadCount || 0);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      onUnreadCountChange?.((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      onUnreadCountChange?.(0);
      showToast({ type: "success", title: "All marked as read", duration: 1500 });
    } catch {
      showToast({ type: "error", title: "Failed to update", duration: 2000 });
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      const removed = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (removed && !removed.read) {
        onUnreadCountChange?.((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await notificationAPI.clearAll();
              setNotifications([]);
              onUnreadCountChange?.(0);
              showToast({ type: "success", title: "All notifications cleared", duration: 1500 });
            } catch {
              showToast({ type: "error", title: "Failed to clear", duration: 2000 });
            }
          },
        },
      ],
    );
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View className="flex-1 bg-gray-950 px-6 pt-16">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBack} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-gray-500 text-xs">
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>
        {notifications.length > 0 && (
          <View className="flex-row items-center">
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                className="mr-3 px-3 py-1.5 bg-green-500/15 rounded-lg"
              >
                <Text className="text-green-400 text-xs font-semibold">
                  Read All
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleClearAll}
              className="px-3 py-1.5 bg-red-500/15 rounded-lg"
            >
              <Text className="text-red-400 text-xs font-semibold">Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center" style={{ marginTop: -60 }}>
          <View className="w-20 h-20 rounded-full bg-gray-800/80 items-center justify-center mb-5">
            <Ionicons name="notifications-off-outline" size={36} color="#4ade80" />
          </View>
          <Text className="text-white text-lg font-bold mb-2">
            No notifications yet
          </Text>
          <Text className="text-gray-500 text-sm text-center px-8">
            You'll receive notifications when posts are published, fail, or are
            scheduled.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
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
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.post_published;
            return (
              <TouchableOpacity
                key={notif._id}
                onPress={() => {
                  if (!notif.read) handleMarkAsRead(notif._id);
                }}
                onLongPress={() => handleDelete(notif._id)}
                className={`flex-row items-start p-4 rounded-2xl border mb-2.5 ${
                  notif.read
                    ? "bg-gray-900/50 border-gray-800/50"
                    : "bg-gray-900/80 border-gray-700"
                }`}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5"
                  style={{ backgroundColor: config.bg }}
                >
                  <Ionicons name={config.icon} size={20} color={config.color} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-sm font-semibold ${
                        notif.read ? "text-gray-400" : "text-white"
                      }`}
                    >
                      {notif.title}
                    </Text>
                    {!notif.read && (
                      <View className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    )}
                  </View>
                  <Text
                    className={`text-xs mt-1 ${
                      notif.read ? "text-gray-600" : "text-gray-400"
                    }`}
                    numberOfLines={2}
                  >
                    {notif.message}
                  </Text>
                  <Text className="text-gray-600 text-[10px] mt-1.5">
                    {getTimeAgo(notif.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
