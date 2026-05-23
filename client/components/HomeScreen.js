import * as Clipboard from "expo-clipboard";
import { View, ScrollView, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import HomeHero from "./HomeHero";
import HomeCompose from "./HomeCompose";
import HomePreview from "./HomePreview";
import PlatformPreview from "./PlatformPreview";
import ScheduleModal from "./ScheduleModal";
import RephraseModal from "./RephraseModal";
import CopyrightModal from "./CopyrightModal";
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
  initialDraft,
  onSaveDraft,
  onPostPublished,
  onResetDraft,
}) {
  const { showToast } = useToast();
  const { colors, resolved } = useTheme();

  const composer = useCreatePost({
    connectedPlatforms,
    connectedPlatformObjects,
    allPlatforms,
    initialDraft,
    onClose: () => onResetDraft?.(),
    onSaveDraft,
    onPostPublished,
  });

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
          />
        }
      >
        <HomeHero
          unreadNotifications={unreadNotifications}
          onNotifications={onNotifications}
        />

        <HomeCompose
          caption={composer.caption}
          setCaption={composer.setCaption}
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
          handlePostPress={composer.handlePostPress}
        />

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
    </View>
  );
}
