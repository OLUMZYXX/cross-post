import { useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import VideoPlayerModal from "./VideoPlayerModal";
import { COLORS } from "../constants/theme";

function VideoPreview({ media, isUploading, onRemove, disabled }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const videoUri = media.cloudinaryUrl || media.uri;

  return (
    <View className="rounded-2xl overflow-hidden border border-rule" style={{ backgroundColor: COLORS.paper }}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => setShowPlayer(true)}>
        {media.thumbnail ? (
          <View className="w-full h-48">
            <Image source={{ uri: media.thumbnail }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-14 h-14 rounded-full bg-ink/70 items-center justify-center">
                <Ionicons name="play" size={28} color={COLORS.paperLight} />
              </View>
            </View>
          </View>
        ) : (
          <View className="w-full h-48 items-center justify-center" style={{ backgroundColor: COLORS.paperDeep }}>
            <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: COLORS.ink }}>
              <Ionicons name="play" size={28} color={COLORS.paperLight} />
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
  return (
    <View className="rounded-2xl overflow-hidden border border-rule" style={{ backgroundColor: COLORS.paper }}>
      <Image source={{ uri: media.uri }} className="w-full h-48" resizeMode="cover" />
      {isUploading && <UploadingOverlay />}
      <RemoveButton onPress={() => onRemove(0)} disabled={disabled} />
    </View>
  );
}

function MultiImagePreview({ media, isUploading, onRemove, disabled }) {
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
        {media.map((item, index) => (
          <View
            key={index}
            className="rounded-xl overflow-hidden mr-2 border border-rule"
            style={{ width: 130, height: 130, backgroundColor: COLORS.paper }}
          >
            <Image source={{ uri: item.uri }} className="w-full h-full" resizeMode="cover" />
            <TouchableOpacity
              onPress={() => onRemove(index)}
              disabled={disabled}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: COLORS.ink }}
            >
              <Ionicons name="close" size={12} color={COLORS.paperLight} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {isUploading && (
        <View className="absolute inset-0 rounded-xl items-center justify-center" style={{ backgroundColor: COLORS.paper + "cc" }}>
          <ActivityIndicator color={COLORS.terracotta} size="large" />
        </View>
      )}
      <Text className="text-ink-muted text-[10px] font-sans-medium mt-2">
        {media.length} images selected
      </Text>
    </View>
  );
}

function UploadingOverlay() {
  return (
    <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: COLORS.paper + "cc" }}>
      <ActivityIndicator color={COLORS.terracotta} size="large" />
      <Text className="text-ink text-xs mt-2 font-sans-semibold">Optimizing...</Text>
    </View>
  );
}

function RemoveButton({ onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
      style={{ backgroundColor: COLORS.ink + "cc" }}
    >
      <Ionicons name="close" size={16} color={COLORS.paperLight} />
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
