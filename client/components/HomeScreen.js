import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import QuickStats from "./QuickStats";
import PlatformStrip from "./PlatformStrip";
import ActivityFeed from "./ActivityFeed";

export default function HomeScreen({
  user,
  sentPosts,
  allPosts,
  connectedPlatforms,
  connectedPlatformObjects,
  loadingPlatforms,
  recentActivities,
  unreadNotifications,
  refreshing,
  onRefresh,
  onCreatePost,
  onNotifications,
  onAddPlatform,
  getPlatformStyle,
  getPlatformUsername,
}) {
  const scheduledCount = allPosts.filter((p) => p.status === "scheduled").length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning \u2600\uFE0F";
    if (hour < 18) return "Good afternoon \uD83C\uDF24\uFE0F";
    return "Good evening \uD83C\uDF19";
  };

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-green-500/5" />
        <View className="absolute top-80 -left-24 w-72 h-72 rounded-full bg-emerald-500/4" />
      </View>

      <View className="flex-1 px-5 pt-14">
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wider uppercase">
              {getGreeting()}
            </Text>
            <Text className="text-white text-2xl font-bold mt-0.5">
              {user?.name?.split(" ")[0] || "User"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onNotifications}
            className="w-11 h-11 rounded-2xl bg-gray-900 items-center justify-center border border-gray-800"
          >
            <Ionicons name="notifications-outline" size={20} color="#9ca3af" />
            {unreadNotifications > 0 && (
              <View className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full min-w-[20px] h-[20px] items-center justify-center px-1">
                <Text className="text-gray-950 text-[10px] font-bold">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4ade80"
              colors={["#4ade80"]}
              progressBackgroundColor="#030712"
            />
          }
        >
          <TouchableOpacity
            onPress={onCreatePost}
            className="rounded-2xl mb-5 overflow-hidden border border-green-500/20"
            activeOpacity={0.8}
          >
            <View className="bg-green-500/10 p-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-2xl bg-green-500 items-center justify-center mr-4">
                  <Ionicons name="add" size={26} color="#030712" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold">Create New Post</Text>
                  <Text className="text-gray-400 text-[11px] mt-0.5">
                    Publish to {connectedPlatforms.length} platform{connectedPlatforms.length !== 1 ? "s" : ""} at once
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#4ade80" />
              </View>
            </View>
          </TouchableOpacity>

          <QuickStats
            publishedCount={sentPosts.length}
            platformCount={connectedPlatforms.length}
            scheduledCount={scheduledCount}
          />

          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-1 h-4 bg-blue-500 rounded-full mr-2" />
              <Text className="text-white text-base font-bold">Platforms</Text>
            </View>
            <TouchableOpacity
              onPress={onAddPlatform}
              className="flex-row items-center bg-green-500/10 rounded-xl px-3 py-1.5"
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={14} color="#4ade80" />
              <Text className="text-green-400 text-[11px] font-semibold ml-1.5">Add New</Text>
            </TouchableOpacity>
          </View>

          {loadingPlatforms ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#4ade80" />
            </View>
          ) : (
            <PlatformStrip
              connectedPlatforms={connectedPlatforms}
              getPlatformStyle={getPlatformStyle}
              getPlatformUsername={getPlatformUsername}
              onAddPlatform={onAddPlatform}
            />
          )}

          <View className="flex-row items-center justify-between mb-3 mt-5">
            <Text className="text-white text-base font-bold">Recent Activity</Text>
            {recentActivities.length > 0 && (
              <View className="bg-gray-900 rounded-full px-2.5 py-1">
                <Text className="text-gray-500 text-[10px] font-medium">
                  Last {recentActivities.length}
                </Text>
              </View>
            )}
          </View>
          <ActivityFeed activities={recentActivities} />
        </ScrollView>
      </View>
    </View>
  );
}

