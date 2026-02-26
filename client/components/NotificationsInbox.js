import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { notificationAPI } from "../services/api";
import { useToast } from "./Toast";
import NotificationItem from "./NotificationItem";

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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handlePress = async (notif) => {
    if (!notif.read) {
      try {
        await notificationAPI.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)),
        );
        onUnreadCountChange?.((prev) => Math.max(0, prev - 1));
      } catch {}
    }
  };

  const handleDelete = async (id) => {
    const removed = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await notificationAPI.delete(id);
      if (removed && !removed.read) {
        onUnreadCountChange?.((prev) => Math.max(0, prev - 1));
      }
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

  const handleClearAll = () => {
    Alert.alert(
      "Clear All",
      "Delete all notifications? This cannot be undone.",
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
              showToast({ type: "success", title: "Cleared", duration: 1500 });
            } catch {
              showToast({ type: "error", title: "Failed to clear", duration: 2000 });
            }
          },
        },
      ],
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <NotificationItem notif={item} onPress={handlePress} onDelete={handleDelete} />
  );

  return (
    <View className="flex-1 bg-gray-950 px-5 pt-14">
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 rounded-xl bg-gray-900 items-center justify-center mr-3 border border-gray-800/60"
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-green-400 text-[10px] font-medium">{unreadCount} unread</Text>
            )}
          </View>
        </View>
        {notifications.length > 0 && (
          <View className="flex-row items-center">
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                className="mr-2 px-3 py-2 bg-green-500/10 rounded-xl border border-green-500/20"
              >
                <Text className="text-green-400 text-[11px] font-semibold">Read All</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleClearAll}
              className="px-3 py-2 bg-red-500/10 rounded-xl border border-red-500/20"
            >
              <Text className="text-red-400 text-[11px] font-semibold">Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center" style={{ marginTop: -60 }}>
          <View className="w-16 h-16 rounded-2xl bg-gray-800 items-center justify-center mb-4">
            <Ionicons name="notifications-off-outline" size={28} color="#6b7280" />
          </View>
          <Text className="text-white text-base font-medium mb-1">No notifications</Text>
          <Text className="text-gray-500 text-xs text-center px-8">
            You'll be notified when posts publish, fail, or go live
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4ade80"
              colors={["#4ade80"]}
              progressBackgroundColor="#111827"
            />
          }
        />
      )}
    </View>
  );
}
