import { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MediaCarousel from "./MediaCarousel";
import FailedResults from "./FailedResults";
import VideoPlayerModal from "./VideoPlayerModal";
import SentPostFooter from "./SentPostFooter";
import { isVideoUrl, getCloudinaryThumbnail } from "../utils/videoHelpers";
import { PLATFORM_STYLES } from "./sentPostUtils";

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

function VideoThumbnail({ uri }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const thumbnailUrl = getCloudinaryThumbnail(uri);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPlayer(true)}>
      <View className="w-full h-44 rounded-t-2xl overflow-hidden bg-gray-800">
        {thumbnailUrl && !thumbError ? (
          <Image
            source={{ uri: thumbnailUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setThumbError(true)}
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="videocam-outline" size={36} color="#6b7280" />
          </View>
        )}
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-12 h-12 rounded-full bg-black/50 items-center justify-center">
            <Ionicons name="play" size={24} color="#fff" />
          </View>
        </View>
      </View>
      <VideoPlayerModal
        visible={showPlayer}
        videoUri={uri}
        onClose={() => setShowPlayer(false)}
      />
    </TouchableOpacity>
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
  if (media.length === 1 && isVideoUrl(media[0])) {
    return <VideoThumbnail uri={media[0]} />;
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

        <SentPostFooter
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
