import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, ScrollView, TextInput } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "./Toast";
import useCreatePost from "../hooks/useCreatePost";
import PlatformPreview from "./PlatformPreview";
import PlatformSelector from "./PlatformSelector";
import MediaPreview from "./MediaPreview";
import ScheduleModal from "./ScheduleModal";
import RephraseModal from "./RephraseModal";
import CopyrightModal from "./CopyrightModal";
import CaptionToolbar from "./CaptionToolbar";
import FontPicker from "./FontPicker";

export default function CreatePost({
  connectedPlatforms,
  connectedPlatformObjects = [],
  allPlatforms,
  onClose,
  onSaveDraft,
  onPostPublished,
  initialDraft,
}) {
  const {
    caption, setCaption, selectedPlatforms, selectedMedia, mediaType,
    isUploading, isPosting,
    showScheduleModal, setShowScheduleModal,
    showRephraseModal, setShowRephraseModal,
    isRephrasing, rephrasedText, selectedTone,
    showCopyrightModal, setShowCopyrightModal,
    isCopyrightChecking, copyrightResult,
    getPlatformStyle, getDisplayName, togglePlatform, hasTwitterSelected,
    handleRephrase, applyRephrase, openRephraseModal, handleShortenForTwitter,
    publishNow, schedulePost, handlePostPress,
    handleCopyrightProceed, handleCopyrightEdit, handleUseSafeVersion, handleAddHashtag,
    handleSaveDraft, handleMediaSelect, removeMedia,
  } = useCreatePost({
    connectedPlatforms, connectedPlatformObjects, allPlatforms,
    initialDraft, onClose, onSaveDraft, onPostPublished,
  });

  const { showToast } = useToast();
  const [showFontPicker, setShowFontPicker] = useState(false);
  const isOverLimit = hasTwitterSelected && caption.length > 280;

  const handleCopy = async () => {
    if (!caption.trim()) {
      showToast({ type: "warning", title: "Nothing to copy", message: "Write something first." });
      return;
    }
    await Clipboard.setStringAsync(caption);
    showToast({ type: "success", title: "Copied!", message: "Text copied to clipboard." });
  };

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="px-5 pt-14 pb-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onClose}
            disabled={isPosting}
            className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800/50 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <Text className="text-white font-bold text-base">Create Post</Text>

          <TouchableOpacity
            onPress={handlePostPress}
            disabled={isPosting || isUploading}
            className={`px-5 py-2.5 rounded-full ${isPosting || isUploading ? "bg-green-500/40" : "bg-green-500"}`}
          >
            <Text className="text-gray-950 font-bold text-sm">
              {isPosting ? "Posting..." : isUploading ? "Wait..." : "Publish"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="bg-gray-900/80 rounded-3xl border border-gray-800/40 mb-4 overflow-hidden">
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="What's on your mind?"
            placeholderTextColor="#4b5563"
            multiline
            className="text-white text-[15px] px-4 pt-4 pb-3 min-h-[140px]"
            textAlignVertical="top"
            editable={!isPosting}
          />

          {hasTwitterSelected && (
            <View className="flex-row items-center px-4 pb-2">
              <View className={`h-1 flex-1 rounded-full mr-3 ${isOverLimit ? "bg-red-500/30" : "bg-gray-800"}`}>
                <View
                  className={`h-full rounded-full ${isOverLimit ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min((caption.length / 280) * 100, 100)}%` }}
                />
              </View>
              <Text className={`text-[10px] font-medium ${isOverLimit ? "text-red-400" : "text-gray-600"}`}>
                {caption.length}/280
              </Text>
            </View>
          )}

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
        </View>

        <PlatformSelector
          connectedPlatforms={connectedPlatforms}
          selectedPlatforms={selectedPlatforms}
          onToggle={togglePlatform}
          getPlatformStyle={getPlatformStyle}
          getDisplayName={getDisplayName}
          disabled={isPosting}
        />

        <PlatformPreview
          selectedPlatforms={selectedPlatforms}
          caption={caption}
          selectedMedia={selectedMedia}
          mediaType={mediaType}
          getPlatformStyle={getPlatformStyle}
          getDisplayName={getDisplayName}
        />
      </ScrollView>

      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onPostNow={publishNow}
        onSchedule={schedulePost}
      />

      <RephraseModal
        visible={showRephraseModal}
        onClose={() => setShowRephraseModal(false)}
        isRephrasing={isRephrasing}
        rephrasedText={rephrasedText}
        selectedTone={selectedTone}
        onSelectTone={handleRephrase}
        onApply={applyRephrase}
        hasTwitterSelected={hasTwitterSelected}
        onShortenForTwitter={handleShortenForTwitter}
      />

      <CopyrightModal
        visible={showCopyrightModal}
        onClose={() => { setShowCopyrightModal(false); }}
        isChecking={isCopyrightChecking}
        result={copyrightResult}
        onProceed={handleCopyrightProceed}
        onEdit={handleCopyrightEdit}
        onUseSafeVersion={handleUseSafeVersion}
        onAddHashtag={handleAddHashtag}
      />
    </View>
  );
}

