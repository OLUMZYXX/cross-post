import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function VideoPreview({ media, isUploading, onRemove, disabled }) {
  return (
    <View className="rounded-2xl overflow-hidden bg-gray-800/60">
      {media.thumbnail ? (
        <View className="w-full h-48">
          <Image source={{ uri: media.thumbnail }} className="w-full h-full" resizeMode="cover" />
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-14 h-14 rounded-full bg-black/50 items-center justify-center">
              <Ionicons name="play" size={28} color="#fff" />
            </View>
          </View>
        </View>
      ) : (
        <View className="w-full h-48 bg-gray-800 items-center justify-center">
          <View className="w-14 h-14 rounded-full bg-gray-700 items-center justify-center">
            <Ionicons name="play" size={28} color="#fff" />
          </View>
        </View>
      )}
      {isUploading && <UploadingOverlay />}
      <RemoveButton onPress={() => onRemove(0)} disabled={disabled} />
    </View>
  );
}

function SingleImagePreview({ media, isUploading, onRemove, disabled }) {
  return (
    <View className="rounded-2xl overflow-hidden bg-gray-800/60">
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
          <View key={index} className="rounded-xl overflow-hidden bg-gray-800/60 mr-2" style={{ width: 130, height: 130 }}>
            <Image source={{ uri: item.uri }} className="w-full h-full" resizeMode="cover" />
            <TouchableOpacity
              onPress={() => onRemove(index)}
              disabled={disabled}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 items-center justify-center"
            >
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {isUploading && (
        <View className="absolute inset-0 bg-black/40 rounded-xl items-center justify-center">
          <ActivityIndicator color="#4ade80" size="large" />
        </View>
      )}
      <Text className="text-gray-600 text-[10px] mt-2">{media.length} images selected</Text>
    </View>
  );
}

function UploadingOverlay() {
  return (
    <View className="absolute inset-0 bg-black/40 items-center justify-center">
      <ActivityIndicator color="#4ade80" size="large" />
      <Text className="text-white text-xs mt-2 font-medium">Optimizing...</Text>
    </View>
  );
}

function RemoveButton({ onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 items-center justify-center"
    >
      <Ionicons name="close" size={16} color="#fff" />
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
