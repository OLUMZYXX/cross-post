import { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ComposeCard from "./ComposeCard";
import MediaPreview from "./MediaPreview";
import CaptionToolbar from "./CaptionToolbar";
import FontPicker from "./FontPicker";
import PlatformSelector from "./PlatformSelector";
import ChunkyButton from "./ChunkyButton";
export default function HomeCompose({
  caption,
  setCaption,
  selectedMedia,
  mediaType,
  isUploading,
  isPosting,
  removeMedia,
  handleMediaSelect,
  openRephraseModal,
  handleCopy,
  handleSaveDraft,
  connectedPlatforms,
  selectedPlatforms,
  togglePlatform,
  getPlatformStyle,
  getDisplayName,
  handlePostPress,
}) {
  const [showFontPicker, setShowFontPicker] = useState(false);
  const canPublish =
    !isPosting &&
    !isUploading &&
    (caption.trim().length > 0 || selectedMedia.length > 0) &&
    selectedPlatforms.length > 0;
  const publishLabel = isPosting ? "Sending..." : isUploading ? "Wait..." : "Publish";

  return (
    <View>
      <ComposeCard caption={caption} onChangeCaption={setCaption} editable={!isPosting}>
        <MediaPreview
          media={selectedMedia}
          mediaType={mediaType}
          isUploading={isUploading}
          onRemove={removeMedia}
          disabled={isPosting}
        />

        <CaptionToolbar
          onMedia={handleMediaSelect}
          onFont={() => setShowFontPicker((v) => !v)}
          onRephrase={openRephraseModal}
          onCopy={handleCopy}
          onDraft={handleSaveDraft}
          captionLength={caption.length}
          disabled={isPosting}
        />

        {showFontPicker && (
          <FontPicker
            caption={caption}
            onChange={setCaption}
            onClose={() => setShowFontPicker(false)}
          />
        )}
      </ComposeCard>

      <View className="px-5 mt-6">
        <PlatformSelector
          connectedPlatforms={connectedPlatforms}
          selectedPlatforms={selectedPlatforms}
          onToggle={togglePlatform}
          getPlatformStyle={getPlatformStyle}
          getDisplayName={getDisplayName}
          disabled={isPosting}
        />
      </View>

      <View className="px-5 mt-2">
        <ChunkyButton
          label={publishLabel}
          onPress={handlePostPress}
          variant="primary"
          disabled={!canPublish}
          fullWidth
          icon={
            <Ionicons
              name={isPosting ? "hourglass-outline" : "send"}
              size={16}
              color="#FFFFFF"
            />
          }
        />
      </View>
    </View>
  );
}
