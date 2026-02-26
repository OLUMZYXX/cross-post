import { StatusBar } from "expo-status-bar";
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
          className="bg-gray-800 rounded-xl px-6 py-3 flex-row items-center"
        >
          <Ionicons name="chevron-down" size={16} color="#4ade80" />
          <Text className="text-green-400 text-sm font-semibold ml-2">
            Load More
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [hasMore]);

  if (!posts || posts.length === 0) {
    return (
      <>
        <StatusBar style="light" />
        <View className="absolute top-0 left-0 right-0 bottom-0">
          <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/5" />
          <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/5" />
        </View>
        <View className="flex-1 px-6 pt-16">
          <View className="mb-6">
            <Text className="text-gray-400 text-sm">Your Content</Text>
            <Text className="text-white text-2xl font-bold">Sent Posts</Text>
          </View>
          <View
            className="flex-1 items-center justify-center"
            style={{ marginTop: -60 }}
          >
            <View className="w-20 h-20 rounded-full bg-gray-800/80 items-center justify-center mb-5">
              <Ionicons
                name="paper-plane-outline"
                size={36}
                color="#4ade80"
              />
            </View>
            <Text className="text-white text-lg font-bold mb-2">
              No posts sent yet
            </Text>
            <Text className="text-gray-500 text-sm text-center px-8">
              When you publish posts to your connected platforms, they'll appear
              here.
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/5" />
        <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/5" />
      </View>

      <View className="flex-1 px-6 pt-16">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-gray-400 text-sm">Your Content</Text>
            <Text className="text-white text-2xl font-bold">Sent Posts</Text>
          </View>
          <View className="bg-green-500/20 rounded-full px-3 py-1">
            <Text className="text-green-400 text-xs font-bold">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </Text>
          </View>
        </View>

        <FlatList
          data={visiblePosts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4ade80"
              colors={["#4ade80"]}
              progressBackgroundColor="#111827"
            />
          }
        />
      </View>
    </>
  );
}
