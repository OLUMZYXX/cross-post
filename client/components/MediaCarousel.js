import { useState } from "react";
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isVideoUrl, getCloudinaryThumbnail } from "../utils/videoHelpers";
import VideoPlayerModal from "./VideoPlayerModal";

const screenWidth = Dimensions.get("window").width;

function CarouselItem({ uri, width }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const isVideo = isVideoUrl(uri);
  const thumbnailUrl = isVideo ? getCloudinaryThumbnail(uri) : null;

  if (isVideo) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPlayer(true)}>
        <View style={{ width, height: 192 }} className="bg-gray-800">
          {thumbnailUrl && !thumbError ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={{ width, height: 192 }}
              resizeMode="cover"
              onError={() => setThumbError(true)}
            />
          ) : (
            <View style={{ width, height: 192 }} className="items-center justify-center">
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

  return (
    <Image
      source={{ uri }}
      style={{ width, height: 192 }}
      resizeMode="cover"
    />
  );
}

export default function MediaCarousel({ media }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = screenWidth - 32;

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(index);
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={cardWidth}
        snapToAlignment="start"
      >
        {media.map((uri, idx) => (
          <CarouselItem key={idx} uri={uri} width={cardWidth} />
        ))}
      </ScrollView>
      {media.length > 1 && (
        <View className="flex-row justify-center items-center py-2 absolute bottom-0 left-0 right-0">
          {media.map((_, idx) => (
            <View
              key={idx}
              className={`w-1.5 h-1.5 rounded-full mx-0.5 ${
                idx === activeIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
