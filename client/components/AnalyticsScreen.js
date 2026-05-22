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


  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="dark" />
      <View className="flex-1 px-6 pt-16">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-ink-muted text-sm">Performance</Text>
            <Text className="text-ink text-2xl font-serif-bold">Analytics</Text>
          </View>
          <View className="flex-row items-center">
            <View className="bg-paper-light rounded-lg px-3 py-1.5 flex-row items-center">
              <Ionicons name="stats-chart" size={14} color="#B14026" />
              <Text className="text-terracotta text-xs font-sans-medium ml-1">
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
              tintColor={"#B14026"}
              colors={["#B14026"]}
              progressBackgroundColor="#E3DAC4"
            />
          }
        >
          <View className="bg-paper-light rounded-2xl p-5 border border-rule mb-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-ink-muted text-xs">TOTAL REACH</Text>
              <View className={`px-2 py-0.5 rounded-full ${overview.growthPercent >= 0 ? "bg-terracotta-soft/30" : "bg-terracotta/15"}`}>
                <Text className={`text-xs font-sans-bold ${overview.growthPercent >= 0 ? "text-terracotta" : "text-terracotta"}`}>
                  {overview.growthPercent >= 0 ? "+" : ""}{overview.growthPercent}%
                </Text>
              </View>
            </View>
            <Text className="text-ink text-4xl font-sans-bold">
              {overview.totalReach.toLocaleString()}
            </Text>
            <Text className="text-ink-muted text-xs mt-1">
              {overview.thisWeekCount} posts this week
            </Text>
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <StatCard
                label="PUBLISHED"
                value={sentPosts.length}
                icon="checkmark-circle"
                iconColor="#B14026"
                iconBg="bg-terracotta-soft/40"
              />
            </View>
            <View className="flex-1 ml-2">
              <StatCard
                label="THIS WEEK"
                value={overview.thisWeekCount}
                icon="trending-up"
                iconColor="#60a5fa"
                iconBg="bg-paper-deep"
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
                iconBg="bg-paper-deep"
              />
            </View>
            <View className="flex-1 ml-2">
              <StatCard
                label="PLATFORMS"
                value={connectedPlatforms.length}
                icon="globe"
                iconColor="#8E311B"
                iconBg="bg-paper-deep"
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

          <PlatformBreakdown platformStats={platformStats} />

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
