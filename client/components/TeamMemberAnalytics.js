import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import PostingBarChart from "./PostingBarChart";

function Stat({ value, label, color }) {
  return (
    <View className="flex-1">
      <Text className="font-serif-bold text-2xl" style={{ color }}>{value}</Text>
      <Text className="text-ink-muted text-[10px] tracking-[1px] uppercase mt-0.5">{label}</Text>
    </View>
  );
}

function PlatformBars({ platforms, colors }) {
  const entries = Object.entries(platforms || {}).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  const max = entries[0][1];

  return (
    <View className="bg-paper-light border border-rule rounded-2xl p-4 mb-3">
      <Text className="text-ink-soft text-[9px] tracking-[1.5px] uppercase mb-3">
        Deliveries per platform
      </Text>
      {entries.map(([name, count]) => (
        <View key={name} className="mb-2.5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-ink text-[12px] font-sans-medium">{name}</Text>
            <Text className="text-ink-muted text-[11px] font-sans-bold">{count}</Text>
          </View>
          <View
            className="w-full rounded-full overflow-hidden"
            style={{ height: 8, backgroundColor: colors.rule }}
          >
            <View
              style={{
                width: `${Math.max((count / max) * 100, 4)}%`,
                height: "100%",
                borderRadius: 999,
                backgroundColor: colors.terracotta,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function monthName(month) {
  const [y, m] = (month || "").split("-").map(Number);
  if (!y || !m) return "";
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function TeamMemberAnalytics({ member, month, onBack }) {
  const colors = getColors();
  if (!member) return null;

  return (
    <View>
      <TouchableOpacity
        onPress={onBack}
        className="flex-row items-center mb-4"
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color={colors.ink} />
        <Text className="text-ink-muted text-sm ml-2">Back to ranking</Text>
      </TouchableOpacity>

      <View className="flex-row items-center mb-1">
        <Text className="text-ink text-xl font-serif-bold flex-1" numberOfLines={1}>
          {member.name}
        </Text>
        {member.rank ? (
          <View className="bg-paper-deep rounded-full px-2.5 py-1">
            <Text className="text-ink-muted text-[10px] font-sans-bold">RANK #{member.rank}</Text>
          </View>
        ) : null}
      </View>
      <Text className="text-ink-muted text-xs mb-4">
        {member.email} · {monthName(month)}
      </Text>

      <View className="bg-paper-light border border-rule rounded-2xl p-4 mb-3 flex-row">
        <Stat value={member.published} label="Published" color={colors.ink} />
        <Stat value={member.scheduled} label="Scheduled" color={colors.info} />
        <Stat value={member.activeDays} label="Active days" color={colors.olive} />
        <Stat
          value={member.successRate === null ? "—" : `${member.successRate}%`}
          label="Success"
          color={member.failed > 0 ? colors.terracotta : colors.olive}
        />
      </View>

      <PostingBarChart daily={member.daily} />

      <View className="bg-paper-light border border-rule rounded-2xl p-4 mb-3 flex-row">
        <Stat
          value={member.busiestDay?.count ? `Day ${member.busiestDay.day}` : "—"}
          label="Busiest day"
          color={colors.ink}
        />
        <Stat value={member.avgPerActiveDay ?? 0} label="Avg / day" color={colors.ink} />
        <Stat value={member.failed} label="Failed" color={colors.terracotta} />
      </View>

      <PlatformBars platforms={member.platforms} colors={colors} />
    </View>
  );
}
