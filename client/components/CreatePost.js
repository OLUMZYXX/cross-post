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
import DuplicateModal from "./DuplicateModal";
import CaptionToolbar from "./CaptionToolbar";
import FontPicker from "./FontPicker";
import ChunkyButton from "./ChunkyButton";
import { TWITTER_CHAR_LIMIT } from "./platformLimits";
import { FONTS, useTheme } from "../constants/theme";

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
    showDuplicateModal, setShowDuplicateModal, duplicateInfo,
    selectedFont, selectFont, handleCaptionChange,
    getPlatformStyle, getDisplayName, togglePlatform, hasTwitterSelected,
    handleRephrase, applyRephrase, openRephraseModal, handleShortenForTwitter,
    publishNow, schedulePost, handlePostPress,
    handleDuplicateProceed, handleDuplicateCancel,
    handleCopyrightProceed, handleCopyrightEdit, handleUseSafeVersion, handleAddHashtag,
    handleSaveDraft, handleMediaSelect, removeMedia,
  } = useCreatePost({
    connectedPlatforms, connectedPlatformObjects, allPlatforms,
    initialDraft, onClose, onSaveDraft, onPostPublished,
  });

  const { showToast } = useToast();
  const { colors, resolved } = useTheme();
  const [showFontPicker, setShowFontPicker] = useState(false);
  const isOverLimit = hasTwitterSelected && caption.length > TWITTER_CHAR_LIMIT;

  const handleCopy = async () => {
    if (!caption.trim()) {
      showToast({ type: "warning", title: "Nothing to copy", message: "Write something first." });
      return;
    }
    await Clipboard.setStringAsync(caption);
    showToast({ type: "success", title: "Copied!", message: "Text copied to clipboard." });
  };

  const publishLabel = isPosting ? "Sending..." : isUploading ? "Wait..." : "Publish";

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />

      <View className="px-5 pt-14 pb-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={onClose} disabled={isPosting} className="w-10 h-10 rounded-full bg-paper-light border border-rule items-center justify-center">
          <Ionicons name="arrow-back" size={18} color={colors.ink} />
        </TouchableOpacity>
        <Text className="text-ink font-serif-bold text-[18px]">Compose</Text>
        <ChunkyButton label={publishLabel} onPress={handlePostPress} variant="primary" disabled={isPosting || isUploading} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="bg-paper-light rounded-3xl border border-rule mb-4 overflow-hidden">
          <TextInput
            value={caption}
            onChangeText={handleCaptionChange}
            placeholder="Say something worth crossing five timelines..."
            placeholderTextColor={colors.inkSoft}
            multiline
            keyboardAppearance={resolved === "dark" ? "dark" : "light"}
            style={{
              fontFamily: FONTS.sans,
              fontSize: 16,
              lineHeight: 24,
              color: colors.ink,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 12,
              minHeight: 140,
            }}
            textAlignVertical="top"
            editable={!isPosting}
          />

          {hasTwitterSelected && (
            <View className="flex-row items-center px-4 pb-2">
              <View className="h-1 flex-1 rounded-full mr-3 bg-rule">
                <View
                  className={`h-full rounded-full ${isOverLimit ? "bg-terracotta" : "bg-olive"}`}
                  style={{ width: `${Math.min((caption.length / TWITTER_CHAR_LIMIT) * 100, 100)}%` }}
                />
              </View>
              <Text className={`text-[10px] font-sans-semibold ${isOverLimit ? "text-terracotta" : "text-ink-muted"}`}>
                {caption.length}/{TWITTER_CHAR_LIMIT.toLocaleString()}
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
              selected={selectedFont}
              onSelectFont={selectFont}
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
        onClose={() => setShowCopyrightModal(false)}
        isChecking={isCopyrightChecking}
        result={copyrightResult}
        onProceed={handleCopyrightProceed}
        onEdit={handleCopyrightEdit}
        onUseSafeVersion={handleUseSafeVersion}
        onAddHashtag={handleAddHashtag}
      />

      <DuplicateModal
        visible={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        info={duplicateInfo}
        onProceed={handleDuplicateProceed}
        onEdit={handleDuplicateCancel}
      />
    </View>
  );
}
