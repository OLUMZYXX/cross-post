import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import HomeHero from "./HomeHero";
import ScorecardModal from "./ScorecardModal";
import HomeCompose from "./HomeCompose";
import HomePreview from "./HomePreview";
import PlatformPreview from "./PlatformPreview";
import ScheduleModal from "./ScheduleModal";
import RephraseModal from "./RephraseModal";
import CopyrightModal from "./CopyrightModal";
import DuplicateModal from "./DuplicateModal";
import { useToast } from "./Toast";
import useCreatePost from "../hooks/useCreatePost";
import { useTheme } from "../constants/theme";

export default function HomeScreen({
  user,
  sentPosts,
  allPosts,
  connectedPlatforms,
  connectedPlatformObjects,
  allPlatforms,
  recentActivities,
  unreadNotifications,
  refreshing,
  onRefresh,
  onNotifications,
  onAddPlatform,
  initialDraft,
  onSaveDraft,
  onPostPublished,
  onResetDraft,
}) {
  const { showToast } = useToast();
  const { colors, resolved } = useTheme();
  const insets = useSafeAreaInsets();

  const composer = useCreatePost({
    connectedPlatforms,
    connectedPlatformObjects,
    allPlatforms,
    initialDraft,
    onClose: () => onResetDraft?.(),
    onSaveDraft,
    onPostPublished,
  });

  const [scorecardVisible, setScorecardVisible] = useState(false);
  const baseImageUrl = composer.selectedMedia.find(
    (m) => m.type === "image" && m.cloudinaryUrl,
  )?.cloudinaryUrl;

  const scheduledCount = allPosts.filter((p) => p.status === "scheduled").length;
  const stats = {
    published: sentPosts.length,
    scheduled: scheduledCount,
    platforms: connectedPlatforms.length,
  };

  const handleCopy = async () => {
    if (!composer.caption.trim()) {
      showToast({ type: "warning", title: "Nothing to copy", message: "Write something first." });
      return;
    }
    await Clipboard.setStringAsync(composer.caption);
    showToast({ type: "success", title: "Copied!", message: "Text copied to clipboard." });
  };

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.terracotta}
            colors={[colors.terracotta]}
            progressBackgroundColor={colors.paperLight}
            progressViewOffset={Platform.OS === "android" ? 16 : 0}
          />
        }
      >
        <HomeHero
          unreadNotifications={unreadNotifications}
          onNotifications={onNotifications}
          compact={sentPosts.length > 0 || allPosts.length > 0}
        />

        <HomeCompose
          caption={composer.caption}
          setCaption={composer.setCaption}
          selectedFont={composer.selectedFont}
          selectFont={composer.selectFont}
          handleCaptionChange={composer.handleCaptionChange}
          selectedMedia={composer.selectedMedia}
          mediaType={composer.mediaType}
          isUploading={composer.isUploading}
          isPosting={composer.isPosting}
          removeMedia={composer.removeMedia}
          handleMediaSelect={composer.handleMediaSelect}
          openRephraseModal={composer.openRephraseModal}
          handleCopy={handleCopy}
          handleSaveDraft={composer.handleSaveDraft}
          connectedPlatforms={connectedPlatforms}
          selectedPlatforms={composer.selectedPlatforms}
          togglePlatform={composer.togglePlatform}
          getPlatformStyle={composer.getPlatformStyle}
          getDisplayName={composer.getDisplayName}
          onAddPlatform={onAddPlatform}
          handlePostPress={composer.handlePostPress}
        />

        {user?.isOwner && (
          <View className="px-5 mt-4">
            <TouchableOpacity
              onPress={() => setScorecardVisible(true)}
              className="flex-row items-center justify-center bg-paper-light border border-olive/40 rounded-xl py-3"
              activeOpacity={0.7}
            >
              <Ionicons name="football-outline" size={18} color={colors.olive} />
              <Text className="text-ink font-sans-semibold text-sm ml-2">Apply Scorecard</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="px-5 mt-6">
          <PlatformPreview
            selectedPlatforms={composer.selectedPlatforms}
            caption={composer.caption}
            selectedMedia={composer.selectedMedia}
            mediaType={composer.mediaType}
            getPlatformStyle={composer.getPlatformStyle}
            getDisplayName={composer.getDisplayName}
          />
        </View>

        <HomePreview recentActivities={recentActivities} stats={stats} />
      </ScrollView>
      </SafeAreaView>

      <ScorecardModal
        visible={scorecardVisible}
        onClose={() => setScorecardVisible(false)}
        user={user}
        baseImageUrl={baseImageUrl}
        onApply={composer.applyScorecard}
      />

      <ScheduleModal
        visible={composer.showScheduleModal}
        onClose={() => composer.setShowScheduleModal(false)}
        onPostNow={composer.publishNow}
        onSchedule={composer.schedulePost}
      />

      <RephraseModal
        visible={composer.showRephraseModal}
        onClose={() => composer.setShowRephraseModal(false)}
        isRephrasing={composer.isRephrasing}
        rephrasedText={composer.rephrasedText}
        selectedTone={composer.selectedTone}
        onSelectTone={composer.handleRephrase}
        onApply={composer.applyRephrase}
        hasTwitterSelected={composer.hasTwitterSelected}
        onShortenForTwitter={composer.handleShortenForTwitter}
      />

      <CopyrightModal
        visible={composer.showCopyrightModal}
        onClose={() => composer.setShowCopyrightModal(false)}
        isChecking={composer.isCopyrightChecking}
        result={composer.copyrightResult}
        onProceed={composer.handleCopyrightProceed}
        onEdit={composer.handleCopyrightEdit}
        onUseSafeVersion={composer.handleUseSafeVersion}
        onAddHashtag={composer.handleAddHashtag}
      />

      <DuplicateModal
        visible={composer.showDuplicateModal}
        onClose={() => composer.setShowDuplicateModal(false)}
        info={composer.duplicateInfo}
        onProceed={composer.handleDuplicateProceed}
        onEdit={composer.handleDuplicateCancel}
      />
    </View>
  );
}
