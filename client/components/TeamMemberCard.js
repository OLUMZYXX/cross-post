import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";

const RANK_STYLE = {
  1: { bg: "#F5C84233", text: "#D4A017", icon: "trophy" },
  2: { bg: "#C0C0C033", text: "#9A9A9A", icon: "medal" },
  3: { bg: "#CD7F3233", text: "#B4712C", icon: "medal" },
};

function formatDate(value) {
  if (!value) return "no posts yet";
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

export default function TeamMemberCard({ member, onPress }) {
  const colors = getColors();

  return (
    <TouchableOpacity
      onPress={() => onPress?.(member)}
      activeOpacity={0.7}
      className="bg-paper-light border border-rule rounded-2xl px-4 py-3 mb-2"
    >
      <View className="flex-row items-center">
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
        <Ionicons name="chevron-forward" size={16} color={colors.inkMuted} />
      </View>

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
    </TouchableOpacity>
  );
}
