import { View, Text, TouchableOpacity } from "react-native";
import { getColors } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export function groupNotifications(notifications) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const groups = { today: [], yesterday: [], earlier: [] };

  notifications.forEach((n) => {
    const date = new Date(n.createdAt);
    if (date >= todayStart) groups.today.push(n);
    else if (date >= yesterdayStart) groups.yesterday.push(n);
    else groups.earlier.push(n);
  });

  const sections = [];
  if (groups.today.length > 0) sections.push({ title: "Today", data: groups.today });
  if (groups.yesterday.length > 0) sections.push({ title: "Yesterday", data: groups.yesterday });
  if (groups.earlier.length > 0) sections.push({ title: "Earlier", data: groups.earlier });
  return sections;
}

export function InboxHeader({ unreadCount, total, onBack, onMarkAllRead, onClearAll }) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-paper-light border border-rule"
          >
            <Ionicons name="arrow-back" size={18} color={getColors().ink} />
          </TouchableOpacity>
          <View>
            <Text className="text-ink text-xl font-jakarta-bold">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-terracotta text-[10px] font-sans-medium mt-0.5">
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <View className="rounded-full px-3 py-1.5 bg-paper-deep border border-rule">
            <Text className="text-ink text-xs font-sans-bold">{unreadCount}</Text>
          </View>
        )}
      </View>

      {total > 0 && (
        <View className="flex-row items-center gap-2">
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={onMarkAllRead}
              className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-paper-light border border-rule"
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done" size={14} color={getColors().olive} />
              <Text className="text-olive text-[11px] font-sans-semibold ml-1.5">
                Mark All Read
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onClearAll}
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-paper-light border border-rule"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color={getColors().terracotta} />
            <Text className="text-terracotta text-[11px] font-sans-semibold ml-1.5">Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center" style={{ marginTop: -80 }}>
      <View
        className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
        style={{
          backgroundColor: getColors().paperLight,
          borderWidth: 1,
          borderColor: getColors().rule,
        }}
      >
        <Ionicons name="notifications-off-outline" size={32} color={getColors().inkSoft} />
      </View>
      <Text className="text-ink text-lg font-jakarta-bold mb-1.5">All caught up</Text>
      <Text className="text-ink-muted text-xs text-center px-12 leading-5">
        You'll be notified when posts publish, fail, or platforms change status
      </Text>
    </View>
  );
}

export function SectionHeader({ title }) {
  return (
    <View className="flex-row items-center mb-2 mt-4">
      <View className="w-1 h-3.5 bg-terracotta rounded-full mr-2" />
      <Text className="text-ink-muted text-[11px] font-sans-bold uppercase tracking-wider">
        {title}
      </Text>
    </View>
  );
}
