import { useState } from "react";
import { View, ScrollView, Image, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

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
          <Image
            key={idx}
            source={{ uri }}
            style={{ width: cardWidth, height: 192 }}
            resizeMode="cover"
          />
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
