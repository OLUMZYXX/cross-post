import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";

const RANK_STYLE = {
  1: { bg: "#F5C84233", text: "#D4A017", icon: "trophy" },
  2: { bg: "#C0C0C033", text: "#9A9A9A", icon: "medal" },
  3: { bg: "#CD7F3233", text: "#B4712C", icon: "medal" },
};

const PLATFORM_ICON = {
  Twitter: "logo-twitter",
  Instagram: "logo-instagram",
  Facebook: "logo-facebook",
  LinkedIn: "logo-linkedin",
  TikTok: "logo-tiktok",
  YouTube: "logo-youtube",
  Reddit: "logo-reddit",
  Telegram: "paper-plane",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Stat({ value, label, color }) {
  return (
    <View className="flex-1">
      <Text className="font-serif-bold text-xl" style={{ color }}>{value}</Text>
      <Text className="text-ink-soft text-[9px] tracking-[1px] uppercase mt-0.5">{label}</Text>
    </View>
  );
}

function RankBadge({ rank }) {
  const style = RANK_STYLE[rank];
  if (!style) {
    return (
      <View className="w-8 h-8 rounded-full bg-paper-deep items-center justify-center mr-3">
        <Text className="text-ink-muted font-sans-bold text-xs">{rank || "–"}</Text>
      </View>
    );
  }
  return (
    <View
      className="w-8 h-8 rounded-full items-center justify-center mr-3"
      style={{ backgroundColor: style.bg }}
    >
      <Ionicons name={style.icon} size={15} color={style.text} />
    </View>
  );
}

export default function TeamMemberCard({ member }) {
  const colors = getColors();
  const [open, setOpen] = useState(false);
  const platforms = Object.entries(member.platforms || {}).sort((a, b) => b[1] - a[1]);
  const posts = member.recentPosts || [];

  return (
    <View className="bg-paper-light border border-rule rounded-2xl px-4 py-3 mb-2">
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
        className="flex-row items-center"
      >
        <RankBadge rank={member.rank} />
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-ink font-sans-bold text-sm" numberOfLines={1}>
              {member.name}
            </Text>
            {member.role === "owner" ? (
              <View className="bg-olive/15 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-olive text-[9px] font-sans-bold">ADMIN</Text>
              </View>
            ) : null}
          </View>
          <Text className="text-ink-soft text-[11px] mt-0.5">
            Last post: {formatDate(member.lastPostAt)}
          </Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.inkMuted}
        />
      </TouchableOpacity>

      <View className="flex-row mt-3">
        <Stat value={member.published} label="Posts" color={colors.ink} />
        <Stat value={member.scheduled} label="Sched" color={colors.info} />
        <Stat value={member.activeDays} label="Days" color={colors.olive} />
        <Stat
          value={member.successRate === null ? "—" : `${member.successRate}%`}
          label="Success"
          color={member.failed > 0 ? colors.terracotta : colors.olive}
        />
      </View>

      {open && (
        <View className="mt-3 pt-3 border-t border-rule">
          {platforms.length > 0 && (
            <View className="flex-row flex-wrap mb-3">
              {platforms.map(([name, count]) => (
                <View
                  key={name}
                  className="flex-row items-center bg-paper-deep rounded-full px-2.5 py-1 mr-2 mb-2"
                >
                  <Ionicons
                    name={PLATFORM_ICON[name] || "globe-outline"}
                    size={11}
                    color={colors.ink}
                  />
                  <Text className="text-ink text-[11px] font-sans-semibold ml-1.5">{count}</Text>
                </View>
              ))}
            </View>
          )}

          <Text className="text-ink-soft text-[9px] tracking-[1.5px] uppercase mb-2">
            Recent activity
          </Text>
          {posts.length === 0 ? (
            <Text className="text-ink-muted text-xs">No posts this month.</Text>
          ) : (
            posts.map((post) => (
              <View key={post.id} className="flex-row items-start mb-2.5">
                <View className="w-1.5 h-1.5 rounded-full bg-olive mt-1.5 mr-2.5" />
                <View className="flex-1">
                  <Text className="text-ink text-[12px] leading-4" numberOfLines={2}>
                    {post.caption || "(media only)"}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Text className="text-ink-soft text-[10px]">{formatDate(post.date)}</Text>
                    {post.platforms?.length ? (
                      <Text className="text-ink-soft text-[10px]">
                        {" · "}
                        {post.platforms.join(", ")}
                      </Text>
                    ) : null}
                    {post.failedCount > 0 ? (
                      <Text className="text-terracotta text-[10px] font-sans-semibold">
                        {" · "}
                        {post.failedCount} failed
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}
