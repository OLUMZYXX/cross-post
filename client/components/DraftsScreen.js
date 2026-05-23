import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert } from "react-native";
import { getColors } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

function DraftCard({ post, iconName, iconColor, iconBg, subtitle, onPress, onDelete }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-paper-light rounded-2xl p-4 border border-rule mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className={`w-10 h-10 rounded-xl ${iconBg} items-center justify-center mr-3`}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-ink text-sm font-sans-medium" numberOfLines={1}>
            {post.caption || post.title || "No caption"}
          </Text>
          <Text className="text-ink-muted text-[10px] mt-0.5">{subtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          className="w-8 h-8 rounded-lg bg-paper-deep items-center justify-center ml-2"
        >
          <Ionicons name="trash-outline" size={13} color={getColors().inkMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, count, color }) {
  const colorMap = {
    yellow: { bg: "bg-paper-deep", text: "text-terracotta-shadow" },
    orange: { bg: "bg-terracotta/15", text: "text-terracotta-shadow" },
    blue: { bg: "bg-paper-deep", text: "text-olive" },
  };
  const c = colorMap[color] || colorMap.yellow;

  return (
    <View className="flex-row items-center justify-between mb-3 mt-3">
      <Text className="text-ink text-sm font-sans-bold">{title}</Text>
      <View className={`${c.bg} rounded-full px-2 py-0.5`}>
        <Text className={`${c.text} text-[10px] font-sans-bold`}>{count}</Text>
      </View>
    </View>
  );
}

export default function DraftsScreen({
  localDrafts,
  serverDrafts,
  scheduledPosts,
  onOpenDraft,
  onOpenServerPost,
  onDeleteLocalDraft,
  onDeleteServerPost,
  onClearAllDrafts,
  refreshing,
  onRefresh,
}) {
  const isEmpty = !localDrafts.length && !serverDrafts.length && !scheduledPosts.length;
  const totalDrafts = localDrafts.length + serverDrafts.length;

  const confirmClearAll = () => {
    Alert.alert(
      "Clear All Drafts",
      `This will permanently delete ${totalDrafts} draft${totalDrafts !== 1 ? "s" : ""}. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: onClearAllDrafts },
      ],
    );
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={getColors().terracotta}
          colors={[getColors().terracotta]}
          progressBackgroundColor={getColors().paperLight}
        />
      }
    >
      {totalDrafts > 1 && (
        <TouchableOpacity
          onPress={confirmClearAll}
          className="flex-row items-center justify-center bg-terracotta/15 border border-terracotta/30 rounded-xl py-2.5 mb-3"
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={14} color={getColors().terracotta} />
          <Text className="text-terracotta text-xs font-sans-semibold ml-1.5">
            Clear All Drafts ({totalDrafts})
          </Text>
        </TouchableOpacity>
      )}

      {isEmpty && (
        <View className="items-center py-16">
          <View className="w-16 h-16 rounded-2xl bg-paper-deep items-center justify-center mb-4">
            <Ionicons name="document-text-outline" size={28} color={getColors().inkMuted} />
          </View>
          <Text className="text-ink font-sans-medium text-base mb-1">No drafts yet</Text>
          <Text className="text-ink-muted text-xs text-center">
            Save posts as drafts or schedule them for later
          </Text>
        </View>
      )}

      {localDrafts.length > 0 && (
        <>
          <SectionHeader title="Local Drafts" count={localDrafts.length} color="yellow" />
          {localDrafts.map((draft) => (
            <DraftCard
              key={draft.id}
              post={draft}
              iconName="bookmark"
              iconColor={getColors().terracottaShadow}
              iconBg="bg-paper-deep"
              subtitle={`${draft.savedAt} · ${draft.platforms?.length || 0} platforms${draft.media?.length > 0 ? " · has media" : ""}`}
              onPress={() => onOpenDraft(draft)}
              onDelete={() => onDeleteLocalDraft(draft.id)}
            />
          ))}
        </>
      )}

      {serverDrafts.length > 0 && (
        <>
          <SectionHeader title="Saved Drafts" count={serverDrafts.length} color="orange" />
          {serverDrafts.map((post) => (
            <DraftCard
              key={post._id}
              post={post}
              iconName="document-text"
              iconColor="#f97316"
              iconBg="bg-terracotta/15"
              subtitle={`${post.platforms?.length || 0} platforms${post.media?.length > 0 ? " · has media" : ""}`}
              onPress={() => onOpenServerPost(post)}
              onDelete={() => onDeleteServerPost(post._id)}
            />
          ))}
        </>
      )}

      {scheduledPosts.length > 0 && (
        <>
          <SectionHeader title="Scheduled" count={scheduledPosts.length} color="blue" />
          {scheduledPosts.map((post) => {
            const schedDate = post.scheduledAt
              ? new Date(post.scheduledAt).toLocaleString("en-US", {
                  month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
                })
              : "";
            return (
              <DraftCard
                key={post._id}
                post={post}
                iconName="time"
                iconColor={getColors().olive}
                iconBg="bg-paper-deep"
                subtitle={`${schedDate} · ${post.platforms?.length || 0} platforms`}
                onPress={() => onOpenServerPost(post)}
                onDelete={() => onDeleteServerPost(post._id)}
              />
            );
          })}
        </>
      )}
    </ScrollView>
  );
}
