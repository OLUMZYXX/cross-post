import { View, Text, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCaptionStatus, getMediaNote } from "./platformLimits";

function CharCounter({ platformName, captionLength }) {
  const { limit, remaining, isOver, percent } = getCaptionStatus(
    platformName,
    captionLength,
  );
  if (limit === 0) return null;

  const color =
    isOver ? "#f87171" : percent >= 80 ? "#fbbf24" : "#4ade80";

  return (
    <View className="flex-row items-center mt-1">
      <View className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden mr-2">
        <View
          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
      <Text style={{ color }} className="text-[10px] font-bold">
        {captionLength}/{limit}
      </Text>
    </View>
  );
}

function MediaPreview({ selectedMedia, mediaType }) {
  if (selectedMedia.length === 0) return null;

  if (mediaType === "video") {
    return (
      <View className="bg-gray-700 rounded-xl h-32 items-center justify-center overflow-hidden">
        {selectedMedia[0].thumbnail ? (
          <View className="w-full h-full">
            <Image
              source={{ uri: selectedMedia[0].thumbnail }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-10 h-10 rounded-full bg-black/50 items-center justify-center">
                <Ionicons name="play" size={20} color="#fff" />
              </View>
            </View>
          </View>
        ) : (
          <View className="items-center">
            <Ionicons name="videocam" size={36} color="#9ca3af" />
            <Text className="text-gray-400 text-xs mt-1">Video</Text>
          </View>
        )}
      </View>
    );
  }

  if (selectedMedia.length === 1) {
    return (
      <View className="bg-gray-700 rounded-xl h-32 overflow-hidden">
        <Image
          source={{ uri: selectedMedia[0].uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {selectedMedia.map((item, idx) => (
        <View
          key={idx}
          className="bg-gray-700 rounded-xl overflow-hidden mr-1"
          style={{ width: 80, height: 80 }}
        >
          <Image
            source={{ uri: item.uri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      ))}
    </ScrollView>
  );
}

export default function PlatformPreview({
  selectedPlatforms,
  caption,
  selectedMedia,
  mediaType,
  getPlatformStyle,
  getDisplayName,
}) {
  if (
    selectedPlatforms.length === 0 ||
    (caption.length === 0 && selectedMedia.length === 0)
  ) {
    return null;
  }

  return (
    <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-4">
      <Text className="text-white font-bold mb-3">Preview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {selectedPlatforms.map((platform) => {
          const baseName = platform.split(":")[0];
          const style = getPlatformStyle(platform);
          const { isOver, limit } = getCaptionStatus(baseName, caption.length);
          const mediaNote = getMediaNote(baseName, mediaType, selectedMedia.length);
          const displayCaption = isOver
            ? caption.slice(0, limit - 3) + "..."
            : caption;

          return (
            <View key={platform} className="bg-gray-800 rounded-2xl p-4 mr-3 w-72">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center mr-3">
                  <Ionicons
                    name={style.icon || "globe-outline"}
                    size={20}
                    color="#fff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>
                    {getDisplayName(platform)}
                  </Text>
                  <Text className="text-gray-500 text-xs">{baseName}</Text>
                </View>
              </View>

              {caption.length > 0 && (
                <Text className="text-gray-300 text-sm mb-1" numberOfLines={3}>
                  {displayCaption}
                </Text>
              )}

              <CharCounter platformName={baseName} captionLength={caption.length} />

              {mediaNote && (
                <View className="flex-row items-center mt-2">
                  <Ionicons name="warning" size={12} color="#fbbf24" />
                  <Text className="text-yellow-400 text-[10px] ml-1">
                    {mediaNote}
                  </Text>
                </View>
              )}

              {selectedMedia.length > 0 && (
                <View className="mt-2">
                  <MediaPreview
                    selectedMedia={selectedMedia}
                    mediaType={mediaType}
                  />
                </View>
              )}

              <View className="flex-row mt-3 pt-3 border-t border-gray-700">
                <Text className="text-gray-500 text-xs mr-4">❤️ Like</Text>
                <Text className="text-gray-500 text-xs mr-4">💬 Comment</Text>
                <Text className="text-gray-500 text-xs">🔄 Share</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
