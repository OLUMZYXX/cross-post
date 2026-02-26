import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MediaCarousel from "./MediaCarousel";
import FailedResults from "./FailedResults";
import {
  PLATFORM_STYLES,
  formatDate,
  formatTime,
  getTimeAgo,
} from "./sentPostUtils";

function PlatformChips({ results }) {
  return (
    <View className="flex-row flex-wrap mb-2">
      {results.map((result, idx) => {
        const style = PLATFORM_STYLES[result.platform];
        return (
          <View
            key={`${result.platform}-${idx}`}
            className="flex-row items-center rounded-full px-2.5 py-1.5 mr-2 mb-1.5 bg-gray-800/80"
          >
            {style && (
              <Ionicons name={style.icon} size={12} color={style.color} />
            )}
            <Text className="text-gray-300 text-[10px] font-medium ml-1.5">
              {result.platform}
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={11}
              color="#4ade80"
              style={{ marginLeft: 4 }}
            />
          </View>
        );
      })}
    </View>
  );
}

function PostMedia({ media }) {
  if (!media || media.length === 0) {
    return (
      <View className="w-full h-16 bg-gray-800/40 items-center justify-center rounded-t-2xl">
        <Ionicons name="document-text-outline" size={24} color="#4b5563" />
      </View>
    );
  }
  if (media.length === 1) {
    return (
      <Image
        source={{ uri: media[0] }}
        className="w-full h-44 rounded-t-2xl"
        resizeMode="cover"
      />
    );
  }
  return <MediaCarousel media={media} />;
}

function StatusFooter({ post, hasFailures, succeededCount, onDelete, isDeleting }) {
  const allFailed = hasFailures && succeededCount === 0;
  return (
    <View className="flex-row items-center justify-between pt-3 border-t border-gray-800/50">
      <View className="flex-row items-center flex-1">
        <View className={`w-5 h-5 rounded-full ${allFailed ? "bg-red-500/15" : "bg-green-500/15"} items-center justify-center mr-1.5`}>
          <Ionicons
            name={allFailed ? "close" : "checkmark"}
            size={10}
            color={allFailed ? "#f87171" : "#4ade80"}
          />
        </View>
        <Text className="text-gray-500 text-[10px]">
          {allFailed
            ? "Failed"
            : hasFailures
              ? "Partial"
              : getTimeAgo(post.publishedAt)}
        </Text>
        <Text className="text-gray-700 text-[10px] mx-1.5">·</Text>
        <Text className="text-gray-600 text-[10px]">
          {formatDate(post.publishedAt)} {formatTime(post.publishedAt)}
        </Text>
      </View>
      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(post)}
          disabled={isDeleting}
          className="w-7 h-7 rounded-lg bg-gray-800/60 items-center justify-center"
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Ionicons name="trash-outline" size={13} color="#6b7280" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function SentPostCard({
  post,
  deletingId,
  retryingMap,
  onDelete,
  onRetry,
  onRetryAll,
}) {
  const postId = post._id || post.id;
  const isDeleting = deletingId === postId;
  const publishResults = post.publishResults || [];
  const failedResults = publishResults.filter((r) => !r.success);
  const succeededResults = publishResults.filter((r) => r.success);
  const hasFailures = failedResults.length > 0;

  return (
    <View
      className="bg-gray-900 rounded-2xl border border-gray-800/60 mb-3 overflow-hidden"
      style={{ opacity: isDeleting ? 0.5 : 1 }}
    >
      <PostMedia media={post.media} />

      <View className="px-4 pt-3 pb-3">
        <Text className="text-white text-sm mb-3" numberOfLines={3}>
          {post.caption || "No caption"}
        </Text>

        {succeededResults.length > 0 && (
          <PlatformChips results={succeededResults} />
        )}

        {hasFailures && (
          <FailedResults
            postId={postId}
            failedResults={failedResults}
            retryingMap={retryingMap}
            onRetry={onRetry}
            onRetryAll={onRetryAll}
            post={post}
          />
        )}

        <StatusFooter
          post={post}
          hasFailures={hasFailures}
          succeededCount={succeededResults.length}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      </View>
    </View>
  );
}
