import { View, Text, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCaptionStatus, getMediaNote } from "./platformLimits";
import SectionRule from "./SectionRule";
import { useTheme } from "../constants/theme";

function CharCounter({ platformName, captionLength }) {
  const { colors } = useTheme();
  const { limit, isOver, percent } = getCaptionStatus(platformName, captionLength);
  if (limit === 0) return null;

  const color = isOver ? colors.terracotta : percent >= 80 ? colors.terracottaShadow : colors.olive;

  return (
    <View className="flex-row items-center mt-1">
      <View className="flex-1 h-1 rounded-full overflow-hidden mr-2" style={{ backgroundColor: colors.rule }}>
        <View style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color, height: "100%" }} />
      </View>
      <Text style={{ color, fontFamily: "HankenGrotesk_700Bold" }} className="text-[10px]">
        {captionLength}/{limit}
      </Text>
    </View>
  );
}

function MiniMediaPreview({ selectedMedia, mediaType }) {
  const { colors } = useTheme();
  if (selectedMedia.length === 0) return null;

  if (mediaType === "video") {
    return (
      <View className="rounded-xl h-32 items-center justify-center overflow-hidden border border-rule" style={{ backgroundColor: colors.paper }}>
        {selectedMedia[0].thumbnail ? (
          <View className="w-full h-full">
            <Image source={{ uri: selectedMedia[0].thumbnail }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.ink + "cc" }}>
                <Ionicons name="play" size={20} color={colors.paperLight} />
              </View>
            </View>
          </View>
        ) : (
          <View className="items-center">
            <Ionicons name="videocam" size={36} color={colors.inkMuted} />
            <Text className="text-ink-muted text-xs mt-1 font-sans-medium">Video</Text>
          </View>
        )}
      </View>
    );
  }

  if (selectedMedia.length === 1) {
    return (
      <View className="rounded-xl h-32 overflow-hidden border border-rule" style={{ backgroundColor: colors.paper }}>
        <Image source={{ uri: selectedMedia[0].uri }} className="w-full h-full" resizeMode="cover" />
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {selectedMedia.map((item, idx) => (
        <View key={idx} className="rounded-xl overflow-hidden mr-1 border border-rule" style={{ width: 80, height: 80, backgroundColor: colors.paper }}>
          <Image source={{ uri: item.uri }} className="w-full h-full" resizeMode="cover" />
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
  const { colors } = useTheme();
  if (selectedPlatforms.length === 0 || (caption.length === 0 && selectedMedia.length === 0)) {
    return null;
  }

  return (
    <View className="rounded-3xl p-4 border border-rule mb-4" style={{ backgroundColor: colors.paperLight }}>
      <SectionRule label="PREVIEW" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        {selectedPlatforms.map((platform) => {
          const baseName = platform.split(":")[0];
          const style = getPlatformStyle(platform);
          const { isOver, limit } = getCaptionStatus(baseName, caption.length);
          const mediaNote = getMediaNote(baseName, mediaType, selectedMedia.length);
          const displayCaption = isOver ? caption.slice(0, limit - 3) + "..." : caption;

          return (
            <View
              key={platform}
              className="rounded-2xl p-4 mr-3 w-72 border border-rule"
              style={{ backgroundColor: colors.paper }}
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.paperDeep }}>
                  <Ionicons name={style.icon || "globe-outline"} size={18} color={colors.ink} />
                </View>
                <View className="flex-1">
                  <Text className="text-ink font-sans-bold text-sm" numberOfLines={1}>
                    {getDisplayName(platform)}
                  </Text>
                  <Text className="text-ink-muted text-xs font-sans">{baseName}</Text>
                </View>
              </View>

              {caption.length > 0 && (
                <Text className="text-ink text-[14px] font-sans mb-1" numberOfLines={3} style={{ lineHeight: 20 }}>
                  {displayCaption}
                </Text>
              )}

              <CharCounter platformName={baseName} captionLength={caption.length} />

              {mediaNote && (
                <View className="flex-row items-center mt-2">
                  <Ionicons name="warning" size={12} color={colors.terracotta} />
                  <Text className="text-terracotta text-[10px] ml-1 font-sans-medium">{mediaNote}</Text>
                </View>
              )}

              {selectedMedia.length > 0 && (
                <View className="mt-2">
                  <MiniMediaPreview selectedMedia={selectedMedia} mediaType={mediaType} />
                </View>
              )}

              <View className="flex-row mt-3 pt-3 border-t border-rule">
                <Text className="text-ink-muted text-xs mr-4 font-sans">♡ Like</Text>
                <Text className="text-ink-muted text-xs mr-4 font-sans">↺ Reply</Text>
                <Text className="text-ink-muted text-xs font-sans">↗ Share</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
