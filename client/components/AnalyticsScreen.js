import { View, Text, ScrollView, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatCard, SuccessRateRing, WeeklyChart, MediaBreakdown } from "./AnalyticsCards";
import PlatformBreakdown from "./PlatformBreakdown";
import {
  computeOverviewStats,
  computePlatformStats,
  computeWeeklyActivity,
  computeMediaStats,
  computeSuccessFailure,
} from "./analyticsUtils";
import BottomNav from "./BottomNav";

export default function AnalyticsScreen({
  sentPosts,
  allPosts,
  connectedPlatforms,
  refreshing,
  onRefresh,
  activeTab,
  onTabChange,
}) {
  const overview = useMemo(() => computeOverviewStats(sentPosts, allPosts), [sentPosts, allPosts]);
  const platformStats = useMemo(() => computePlatformStats(sentPosts), [sentPosts]);
  const weekly = useMemo(() => computeWeeklyActivity(sentPosts), [sentPosts]);
  const media = useMemo(() => computeMediaStats(sentPosts), [sentPosts]);
  const successFailure = useMemo(() => computeSuccessFailure(sentPosts), [sentPosts]);

  const maxTotal = platformStats.length > 0 ? platformStats[0].total : 0;

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />
      <View className="flex-1 px-6 pt-16">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-gray-400 text-sm">Performance</Text>
            <Text className="text-white text-2xl font-bold">Analytics</Text>
          </View>
          <View className="flex-row items-center">
            <View className="bg-gray-900 rounded-lg px-3 py-1.5 flex-row items-center">
              <Ionicons name="stats-chart" size={14} color="#4ade80" />
              <Text className="text-green-400 text-xs font-medium ml-1">
                {sentPosts.length} posts
              </Text>
            </View>
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
          <View className="bg-gray-900/80 rounded-2xl p-5 border border-gray-800 mb-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-400 text-xs">TOTAL REACH</Text>
              <View className={`px-2 py-0.5 rounded-full ${overview.growthPercent >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <Text className={`text-xs font-bold ${overview.growthPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {overview.growthPercent >= 0 ? "+" : ""}{overview.growthPercent}%
                </Text>
              </View>
            </View>
            <Text className="text-white text-4xl font-bold">
              {overview.totalReach.toLocaleString()}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              {overview.thisWeekCount} posts this week
            </Text>
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <StatCard
                label="PUBLISHED"
                value={sentPosts.length}
                icon="checkmark-circle"
                iconColor="#4ade80"
                iconBg="bg-green-500/20"
              />
            </View>
            <View className="flex-1 ml-2">
              <StatCard
                label="THIS WEEK"
                value={overview.thisWeekCount}
                icon="trending-up"
                iconColor="#60a5fa"
                iconBg="bg-blue-500/20"
              />
            </View>
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <StatCard
                label="SCHEDULED"
                value={overview.scheduledCount}
                icon="time"
                iconColor="#a78bfa"
                iconBg="bg-purple-500/20"
              />
            </View>
            <View className="flex-1 ml-2">
              <StatCard
                label="PLATFORMS"
                value={connectedPlatforms.length}
                icon="globe"
                iconColor="#f59e0b"
                iconBg="bg-yellow-500/20"
              />
            </View>
          </View>

          {successFailure.total > 0 && (
            <SuccessRateRing
              successRate={successFailure.successRate}
              totalSuccess={successFailure.totalSuccess}
              totalFailed={successFailure.totalFailed}
            />
          )}

          <WeeklyChart days={weekly.days} maxCount={weekly.maxCount} />

          <PlatformBreakdown platformStats={platformStats} maxTotal={maxTotal} />

          {sentPosts.length > 0 && (
            <MediaBreakdown
              withMedia={media.withMedia}
              textOnly={media.textOnly}
              totalMedia={media.totalMedia}
            />
          )}
        </ScrollView>
      </View>
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </View>
  );
}
