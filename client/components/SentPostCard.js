import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MediaCarousel from "./MediaCarousel";
import {
  PLATFORM_STYLES,
  formatDate,
  formatTime,
  getTimeAgo,
} from "./sentPostUtils";

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
  const isRetryingAll = retryingMap[`${postId}-all`];

  return (
    <View
      className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-4 overflow-hidden"
      style={{ opacity: isDeleting ? 0.5 : 1 }}
    >
      {post.media && post.media.length > 0 ? (
        post.media.length === 1 ? (
          <Image
            source={{ uri: post.media[0] }}
            className="w-full h-48"
            resizeMode="cover"
          />
        ) : (
          <MediaCarousel media={post.media} />
        )
      ) : (
        <View className="w-full h-20 bg-gray-800/50 items-center justify-center">
          <Ionicons name="document-text-outline" size={28} color="#6b7280" />
        </View>
      )}

      <View className="p-4">
        <Text className="text-white text-sm mb-3" numberOfLines={3}>
          {post.caption || "No caption"}
        </Text>

        {succeededResults.length > 0 && (
          <View className="flex-row flex-wrap mb-2">
            {succeededResults.map((result, idx) => {
              const style = PLATFORM_STYLES[result.platform];
              return (
                <View
                  key={`${result.platform}-${idx}`}
                  className="flex-row items-center rounded-full px-2.5 py-1.5 mr-2 mb-1.5 bg-gray-800"
                >
                  {style && (
                    <Ionicons name={style.icon} size={13} color={style.color} />
                  )}
                  <Text className="text-gray-300 text-xs font-medium ml-1.5">
                    {result.platform}
                  </Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color="#4ade80"
                    style={{ marginLeft: 5 }}
                  />
                </View>
              );
            })}
          </View>
        )}

        {hasFailures && (
          <View className="bg-red-500/5 rounded-xl border border-red-500/15 p-3 mb-3">
            <View className="flex-row items-center mb-2.5">
              <Ionicons name="alert-circle" size={14} color="#f87171" />
              <Text className="text-red-400 text-xs font-semibold ml-1.5">
                Failed to publish ({failedResults.length})
              </Text>
            </View>
            {failedResults.map((result, idx) => {
              const style = PLATFORM_STYLES[result.platform];
              const retryKey = `${postId}-${result.platform}-${idx}`;
              const isRetrying = retryingMap[retryKey];

              return (
                <View
                  key={`${result.platform}-${idx}`}
                  className="flex-row items-center bg-gray-900/80 rounded-xl px-3 py-2.5 mb-1.5"
                >
                  <View className="flex-row items-center flex-1">
                    {style && (
                      <View className="w-7 h-7 rounded-lg bg-gray-800 items-center justify-center mr-2.5">
                        <Ionicons name={style.icon} size={14} color="#f87171" />
                      </View>
                    )}
                    <View className="flex-1 mr-2">
                      <Text className="text-white text-xs font-medium">
                        {result.platform}
                      </Text>
                      <Text
                        className="text-gray-500 text-[10px] mt-0.5"
                        numberOfLines={1}
                      >
                        {result.error || "Publishing failed"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRetry(post, result.platform)}
                    disabled={isRetrying || isRetryingAll}
                    className={`flex-row items-center px-3 py-1.5 rounded-lg ${
                      isRetrying || isRetryingAll
                        ? "bg-gray-700"
                        : "bg-red-500/20"
                    }`}
                  >
                    {isRetrying ? (
                      <ActivityIndicator size="small" color="#f87171" />
                    ) : (
                      <>
                        <Ionicons name="refresh" size={12} color="#f87171" />
                        <Text className="text-red-400 text-xs font-semibold ml-1">
                          Retry
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}

            {failedResults.length > 1 && (
              <TouchableOpacity
                onPress={() => onRetryAll(post)}
                disabled={isRetryingAll}
                className={`flex-row items-center justify-center py-2.5 rounded-xl mt-1.5 ${
                  isRetryingAll ? "bg-gray-700" : "bg-red-500/15"
                }`}
              >
                {isRetryingAll ? (
                  <ActivityIndicator size="small" color="#f87171" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={14} color="#f87171" />
                    <Text className="text-red-400 text-xs font-bold ml-1.5">
                      Retry All Failed
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="flex-row items-center justify-between border-t border-gray-800 pt-3">
          <View className="flex-row items-center flex-1">
            <Ionicons
              name={
                hasFailures && succeededResults.length === 0
                  ? "alert-circle"
                  : "checkmark-circle"
              }
              size={14}
              color={
                hasFailures && succeededResults.length === 0
                  ? "#f87171"
                  : "#4ade80"
              }
            />
            <Text className="text-gray-500 text-xs ml-1">
              {hasFailures && succeededResults.length === 0
                ? "Publishing failed"
                : hasFailures
                  ? "Partially published"
                  : `Published ${getTimeAgo(post.publishedAt)}`}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-600 text-xs mr-3">
              {formatDate(post.publishedAt)} • {formatTime(post.publishedAt)}
            </Text>
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(post)}
                disabled={isDeleting}
                className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center"
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Ionicons name="trash-outline" size={14} color="#ef4444" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
