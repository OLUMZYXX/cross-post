import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
            className="w-10 h-10 rounded-xl bg-gray-900 items-center justify-center mr-3 border border-gray-800/60"
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-green-400 text-[10px] font-medium mt-0.5">
                {unreadCount} new
              </Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <View className="bg-green-500/10 rounded-full px-3 py-1.5 border border-green-500/20">
            <Text className="text-green-400 text-xs font-bold">{unreadCount}</Text>
          </View>
        )}
      </View>

      {total > 0 && (
        <View className="flex-row items-center">
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={onMarkAllRead}
              className="flex-1 mr-2"
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#4ade8020", "#4ade8008"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl p-[1px]"
              >
                <View className="bg-gray-950 rounded-xl py-2.5 items-center flex-row justify-center">
                  <Ionicons name="checkmark-done" size={14} color="#4ade80" />
                  <Text className="text-green-400 text-[11px] font-semibold ml-1.5">
                    Mark All Read
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClearAll} className="flex-1" activeOpacity={0.7}>
            <LinearGradient
              colors={["#f8717120", "#f8717108"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl p-[1px]"
            >
              <View className="bg-gray-950 rounded-xl py-2.5 items-center flex-row justify-center">
                <Ionicons name="trash-outline" size={14} color="#f87171" />
                <Text className="text-red-400 text-[11px] font-semibold ml-1.5">Clear All</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center" style={{ marginTop: -80 }}>
      <LinearGradient
        colors={["#6b728020", "#6b728008", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl p-[1px] mb-5"
      >
        <View className="bg-gray-950 rounded-3xl w-20 h-20 items-center justify-center">
          <Ionicons name="notifications-off-outline" size={32} color="#4b5563" />
        </View>
      </LinearGradient>
      <Text className="text-white text-lg font-bold mb-1.5">All caught up</Text>
      <Text className="text-gray-500 text-xs text-center px-12 leading-5">
        You'll be notified when posts publish, fail, or platforms change status
      </Text>
    </View>
  );
}

export function SectionHeader({ title }) {
  return (
    <View className="flex-row items-center mb-2.5 mt-3">
      <View className="w-1 h-3.5 bg-green-500 rounded-full mr-2" />
      <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
        {title}
      </Text>
    </View>
  );
}
