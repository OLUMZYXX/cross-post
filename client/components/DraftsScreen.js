import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function DraftCard({ post, iconName, iconColor, iconBg, subtitle, onPress, onDelete }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3"
    >
      <View className="flex-row items-center">
        <View className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center mr-3`}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-white text-sm font-medium" numberOfLines={1}>
            {post.caption || post.title || "No caption"}
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center ml-2"
        >
          <Ionicons name="trash-outline" size={14} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, count, color }) {
  const colorMap = {
    yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
    orange: { bg: "bg-orange-500/20", text: "text-orange-400" },
    blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  };
  const c = colorMap[color] || colorMap.yellow;

  return (
    <View className="flex-row items-center justify-between mb-4 mt-2">
      <Text className="text-white text-lg font-bold">{title}</Text>
      <View className={`${c.bg} rounded-full px-2.5 py-0.5`}>
        <Text className={`${c.text} text-xs font-bold`}>{count}</Text>
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
  refreshing,
  onRefresh,
}) {
  const isEmpty = !localDrafts.length && !serverDrafts.length && !scheduledPosts.length;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4ade80"
          colors={["#4ade80"]}
          progressBackgroundColor="#111827"
        />
      }
    >
      {isEmpty && (
        <View className="items-center py-16">
          <View className="w-16 h-16 rounded-2xl bg-gray-800 items-center justify-center mb-4">
            <Ionicons name="document-text-outline" size={32} color="#6b7280" />
          </View>
          <Text className="text-white font-medium text-base mb-1">No drafts yet</Text>
          <Text className="text-gray-500 text-sm text-center">
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
              iconColor="#f59e0b"
              iconBg="bg-yellow-500/20"
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
              iconBg="bg-orange-500/20"
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
                iconColor="#3b82f6"
                iconBg="bg-blue-500/20"
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
