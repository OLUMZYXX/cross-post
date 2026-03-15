import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { notificationAPI } from "../services/api";
import { useToast } from "./Toast";
import NotificationItem from "./NotificationItem";
import {
  groupNotifications,
  InboxHeader,
  EmptyState,
  SectionHeader,
} from "./NotificationHelpers";

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
    Alert.alert("Clear All", "Delete all notifications? This cannot be undone.", [
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
    ]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const sections = useMemo(() => groupNotifications(notifications), [notifications]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-950 px-5 pt-14">
      <InboxHeader
        unreadCount={unreadCount}
        total={notifications.length}
        onBack={onBack}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
      />

      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <SectionList
          sections={sections}
          renderItem={({ item }) => (
            <NotificationItem notif={item} onPress={handlePress} onDelete={handleDelete} />
          )}
          renderSectionHeader={({ section: { title } }) => <SectionHeader title={title} />}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          stickySectionHeadersEnabled={false}
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
