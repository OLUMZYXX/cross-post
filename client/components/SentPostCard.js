import { useState } from "react";
import { getColors } from "../constants/theme";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MediaCarousel from "./MediaCarousel";
import FailedResults from "./FailedResults";
import VideoPlayerModal from "./VideoPlayerModal";
import SentPostFooter from "./SentPostFooter";
import { isVideoUrl, getCloudinaryThumbnail } from "../utils/videoHelpers";
import { PLATFORM_STYLES } from "./sentPostUtils";

function formatTimeOfDay(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function PlatformChips({ results }) {
  const colors = getColors();
  return (
    <View className="flex-row flex-wrap mb-2">
      {results.map((result, idx) => {
        const style = PLATFORM_STYLES[result.platform];
        return (
          <View
            key={`${result.platform}-${idx}`}
            className="flex-row items-center rounded-full px-2.5 py-1 mr-1.5 mb-1.5 bg-paper border border-rule"
          >
            {style && (
              <Ionicons name={style.icon} size={11} color={colors.ink} />
            )}
            <Text className="text-ink text-[10px] font-sans-semibold ml-1.5 tracking-[0.5px]">
              {result.platform}
            </Text>
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
  const colors = getColors();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPlayer(true)}>
      <View className="w-full h-44 rounded-t-2xl overflow-hidden bg-paper-deep">
        {thumbnailUrl && !thumbError ? (
          <Image source={{ uri: thumbnailUrl }} className="w-full h-full" resizeMode="cover" onError={() => setThumbError(true)} />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="videocam-outline" size={36} color={colors.inkMuted} />
          </View>
        )}
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-12 h-12 rounded-full bg-ink/55 items-center justify-center">
            <Ionicons name="play" size={24} color={colors.paperLight} />
          </View>
        </View>
      </View>
      <VideoPlayerModal visible={showPlayer} videoUri={uri} onClose={() => setShowPlayer(false)} />
    </TouchableOpacity>
  );
}

function PostMedia({ media }) {
  if (!media || media.length === 0) return null;
  if (media.length === 1 && isVideoUrl(media[0])) return <VideoThumbnail uri={media[0]} />;
  if (media.length === 1) {
    return <Image source={{ uri: media[0] }} className="w-full h-44 rounded-t-2xl" resizeMode="cover" />;
  }
  return <MediaCarousel media={media} />;
}

export default function SentPostCard({ post, deletingId, retryingMap, onDelete, onRetry, onRetryAll }) {
  const postId = post._id || post.id;
  const isDeleting = deletingId === postId;
  const publishResults = post.publishResults || [];
  const failedResults = publishResults.filter((r) => !r.success);
  const succeededResults = publishResults.filter((r) => r.success);
  const hasFailures = failedResults.length > 0;
  const hasMedia = !!(post.media && post.media.length > 0);
  const timeOfDay = formatTimeOfDay(post.publishedAt || post.createdAt);

  return (
    <View
      className="bg-paper-light rounded-3xl border border-rule mb-3 overflow-hidden"
      style={{ opacity: isDeleting ? 0.5 : 1 }}
    >
      {hasMedia && <PostMedia media={post.media} />}

      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center mb-2">
          <Text className="text-ink-muted text-[10px] font-sans-bold tracking-[2px] flex-1">
            {timeOfDay ? `SENT · ${timeOfDay.toUpperCase()}` : "SENT"}
          </Text>
          {hasFailures && (
            <View className="flex-row items-center bg-terracotta/15 border border-terracotta/30 rounded-full px-2 py-0.5">
              <Ionicons name="alert-circle" size={10} color={getColors().terracotta} />
              <Text className="text-terracotta text-[10px] font-sans-bold ml-1">
                {failedResults.length} failed
              </Text>
            </View>
          )}
        </View>

        {!!post.caption && (
          <Text className="text-ink font-serif text-[16px] mb-3" style={{ lineHeight: 22 }} numberOfLines={4}>
            {post.caption}
          </Text>
        )}

        {succeededResults.length > 0 && <PlatformChips results={succeededResults} />}

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

        <View className="border-t border-rule pt-2 mt-1">
          <SentPostFooter
            post={post}
            hasFailures={hasFailures}
            succeededCount={succeededResults.length}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </View>
      </View>
    </View>
  );
}
