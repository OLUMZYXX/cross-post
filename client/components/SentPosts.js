import {
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useState, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import SentPostCard from "./SentPostCard";
import SectionRule from "./SectionRule";
import useSentPostActions from "./useSentPostActions";
import { getColors } from "../constants/theme";

const PAGE_SIZE = 10;

function bucketLabel(d) {
  const date = new Date(d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const that = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = (today - that) / 86400000;
  if (diff <= 0) return "TODAY";
  if (diff < 2) return "YESTERDAY";
  if (diff < 7) return "EARLIER THIS WEEK";
  if (diff < 30) return "THIS MONTH";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
}

function groupPosts(posts) {
  const groups = [];
  let currentLabel = null;
  for (const p of posts) {
    const label = bucketLabel(p.publishedAt || p.createdAt || Date.now());
    if (label !== currentLabel) {
      groups.push({ type: "header", id: `h-${label}-${groups.length}`, label });
      currentLabel = label;
    }
    groups.push({ type: "post", id: p._id || p.id, post: p });
  }
  return groups;
}

function EmptyState({ colors }) {
  return (
    <View className="flex-1 items-center justify-center px-8" style={{ marginTop: -40 }}>
      <View className="w-16 h-16 rounded-2xl bg-paper-light items-center justify-center mb-4 border border-rule">
        <Ionicons name="paper-plane-outline" size={28} color={colors.terracotta} />
      </View>
      <Text className="text-ink font-serif-bold text-[18px] mb-1.5">
        Nothing sent yet.
      </Text>
      <Text className="text-ink-muted text-[13px] text-center leading-[19px] max-w-[260px]">
        Posts you publish from Home will land here{"\n"}with their full delivery history.
      </Text>
    </View>
  );
}

export default function SentPosts({ posts, refreshing, onRefresh, onDeletePost }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { deletingId, retryingMap, handleDelete, handleRetry, handleRetryAll } =
    useSentPostActions(onDeletePost, onRefresh);
  const colors = getColors();

  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);
  const hasMore = posts.length > visibleCount;
  const rows = useMemo(() => groupPosts(visiblePosts), [visiblePosts]);

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === "header") {
        return (
          <View className="mt-5 mb-3">
            <SectionRule label={item.label} />
          </View>
        );
      }
      return (
        <SentPostCard
          post={item.post}
          deletingId={deletingId}
          retryingMap={retryingMap}
          onDelete={handleDelete}
          onRetry={handleRetry}
          onRetryAll={handleRetryAll}
        />
      );
    },
    [deletingId, retryingMap, handleDelete, handleRetry, handleRetryAll],
  );

  const renderFooter = useCallback(() => {
    if (!hasMore) return <View className="h-24" />;
    return (
      <View className="items-center py-4 mb-24">
        <TouchableOpacity
          onPress={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          className="bg-paper-light border border-rule rounded-full px-5 py-2.5 flex-row items-center"
          activeOpacity={0.75}
        >
          <Text className="text-ink font-sans-bold text-[12px] mr-1.5">Load more</Text>
          <Ionicons name="chevron-down" size={13} color={colors.ink} />
        </TouchableOpacity>
      </View>
    );
  }, [hasMore, colors.ink]);

  if (!posts || posts.length === 0) {
    return <EmptyState colors={colors} />;
  }

  return (
    <FlatList
      data={rows}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.terracotta}
          colors={[colors.terracotta]}
          progressBackgroundColor={colors.paperLight}
        />
      }
    />
  );
}
