import { useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import VideoPlayerModal from "./VideoPlayerModal";
import ImageViewerModal from "./ImageViewerModal";
import { useTheme } from "../constants/theme";

const displayUri = (item) => item.cloudinaryUrl || item.uri;

function VideoPreview({ media, isUploading, onRemove, disabled }) {
  const { colors } = useTheme();
  const [showPlayer, setShowPlayer] = useState(false);
  const videoUri = media.cloudinaryUrl || media.uri;

  return (
    <View className="rounded-2xl overflow-hidden border border-rule" style={{ backgroundColor: colors.paper }}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => setShowPlayer(true)}>
        {media.thumbnail ? (
          <View className="w-full h-48">
            <Image source={{ uri: media.thumbnail }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-14 h-14 rounded-full bg-ink/70 items-center justify-center">
                <Ionicons name="play" size={28} color={colors.paperLight} />
              </View>
            </View>
          </View>
        ) : (
          <View className="w-full h-48 items-center justify-center" style={{ backgroundColor: colors.paperDeep }}>
            <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: colors.ink }}>
              <Ionicons name="play" size={28} color={colors.paperLight} />
            </View>
          </View>
        )}
      </TouchableOpacity>
      {isUploading && <UploadingOverlay />}
      <RemoveButton onPress={() => onRemove(0)} disabled={disabled} />
      <VideoPlayerModal visible={showPlayer} videoUri={videoUri} onClose={() => setShowPlayer(false)} />
    </View>
  );
}

function SingleImagePreview({ media, isUploading, onRemove, disabled }) {
  const { colors } = useTheme();
  const [showViewer, setShowViewer] = useState(false);
  return (
    <View className="rounded-2xl overflow-hidden border border-rule" style={{ backgroundColor: colors.paper }}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => setShowViewer(true)}>
        <Image source={{ uri: displayUri(media) }} className="w-full h-48" resizeMode="cover" />
        <View className="absolute bottom-2 left-2 flex-row items-center rounded-full px-2 py-1" style={{ backgroundColor: colors.ink + "b3" }}>
          <Ionicons name="expand-outline" size={11} color={colors.paperLight} />
          <Text className="text-[10px] font-sans-semibold ml-1" style={{ color: colors.paperLight }}>Preview</Text>
        </View>
      </TouchableOpacity>
      {isUploading && <UploadingOverlay />}
      <RemoveButton onPress={() => onRemove(0)} disabled={disabled} />
      <ImageViewerModal visible={showViewer} imageUri={displayUri(media)} onClose={() => setShowViewer(false)} />
    </View>
  );
}

function MultiImagePreview({ media, isUploading, onRemove, disabled }) {
  const { colors } = useTheme();
  const [viewerIndex, setViewerIndex] = useState(null);
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
        {media.map((item, index) => (
          <View
            key={index}
            className="rounded-xl overflow-hidden mr-2 border border-rule"
            style={{ width: 130, height: 130, backgroundColor: colors.paper }}
          >
            <TouchableOpacity activeOpacity={0.85} onPress={() => setViewerIndex(index)}>
              <Image source={{ uri: displayUri(item) }} className="w-full h-full" resizeMode="cover" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onRemove(index)}
              disabled={disabled}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.ink }}
            >
              <Ionicons name="close" size={12} color={colors.paperLight} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <ImageViewerModal
        visible={viewerIndex !== null}
        imageUri={viewerIndex !== null ? displayUri(media[viewerIndex]) : null}
        onClose={() => setViewerIndex(null)}
      />
      {isUploading && (
        <View className="absolute inset-0 rounded-xl items-center justify-center" style={{ backgroundColor: colors.paper + "cc" }}>
          <ActivityIndicator color={colors.terracotta} size="large" />
        </View>
      )}
      <Text className="text-ink-muted text-[10px] font-sans-medium mt-2">
        {media.length} images selected
      </Text>
    </View>
  );
}

function UploadingOverlay() {
  const { colors } = useTheme();
  return (
    <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: colors.paper + "cc" }}>
      <ActivityIndicator color={colors.terracotta} size="large" />
      <Text className="text-ink text-xs mt-2 font-sans-semibold">Optimizing...</Text>
    </View>
  );
}

function RemoveButton({ onPress, disabled }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
      style={{ backgroundColor: colors.ink + "cc" }}
    >
      <Ionicons name="close" size={16} color={colors.paperLight} />
    </TouchableOpacity>
  );
}

export default function MediaPreview({ media, mediaType, isUploading, onRemove, disabled }) {
  if (media.length === 0) return null;

  return (
    <View className="px-4 pb-3">
      {mediaType === "video" ? (
        <VideoPreview media={media[0]} isUploading={isUploading} onRemove={onRemove} disabled={disabled} />
      ) : media.length === 1 ? (
        <SingleImagePreview media={media[0]} isUploading={isUploading} onRemove={onRemove} disabled={disabled} />
      ) : (
        <MultiImagePreview media={media} isUploading={isUploading} onRemove={onRemove} disabled={disabled} />
      )}
    </View>
  );
}
