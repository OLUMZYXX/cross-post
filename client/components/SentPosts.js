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
import useSentPostActions from "./useSentPostActions";

const PAGE_SIZE = 10;

export default function SentPosts({
  posts,
  refreshing,
  onRefresh,
  onDeletePost,
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const {
    deletingId,
    retryingMap,
    handleDelete,
    handleRetry,
    handleRetryAll,
  } = useSentPostActions(onDeletePost, onRefresh);

  const visiblePosts = useMemo(
    () => posts.slice(0, visibleCount),
    [posts, visibleCount],
  );
  const hasMore = posts.length > visibleCount;

  const renderItem = useCallback(
    ({ item }) => (
      <SentPostCard
        post={item}
        deletingId={deletingId}
        retryingMap={retryingMap}
        onDelete={handleDelete}
        onRetry={handleRetry}
        onRetryAll={handleRetryAll}
      />
    ),
    [deletingId, retryingMap, handleDelete, handleRetry, handleRetryAll],
  );

  const keyExtractor = useCallback((item) => item._id || item.id, []);

  const renderFooter = useCallback(() => {
    if (!hasMore) return <View className="h-24" />;
    return (
      <View className="items-center py-4 mb-24">
        <TouchableOpacity
          onPress={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          className="bg-paper-deep rounded-xl px-5 py-2.5 flex-row items-center"
        >
          <Ionicons name="chevron-down" size={14} color="#B14026" />
          <Text className="text-terracotta text-xs font-sans-semibold ml-1.5">
            Load More
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [hasMore]);

  if (!posts || posts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ marginTop: -40 }}>
        <View className="w-16 h-16 rounded-2xl bg-paper-deep items-center justify-center mb-4">
          <Ionicons name="paper-plane-outline" size={28} color="#564B3F" />
        </View>
        <Text className="text-ink text-base font-sans-medium mb-1">No posts yet</Text>
        <Text className="text-ink-muted text-xs text-center">
          Published posts will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={visiblePosts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={"#B14026"}
          colors={["#B14026"]}
          progressBackgroundColor="#E3DAC4"
        />
      }
    />
  );
}
