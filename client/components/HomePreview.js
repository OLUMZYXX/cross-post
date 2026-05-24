import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionRule from "./SectionRule";
import { useTheme } from "../constants/theme";

export default function HomePreview({ recentActivities = [], stats }) {
  return (
    <View className="px-5 mt-7 mb-4">
      <SectionRule label="PREVIEW" />

      <View className="flex-row mt-4">
        <StatCell label="Sent" value={stats?.published || 0} />
        <View className="w-px bg-rule mx-3" />
        <StatCell label="Scheduled" value={stats?.scheduled || 0} />
        <View className="w-px bg-rule mx-3" />
        <StatCell label="Platforms" value={stats?.platforms || 0} />
      </View>

      <View className="mt-5">
        <SectionRule label="LATEST" accent />
        {recentActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <View className="mt-3">
            {recentActivities.slice(0, 3).map((a) => (
              <PreviewRow key={a.id} activity={a} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function StatCell({ label, value }) {
  return (
    <View className="flex-1">
      <Text className="text-ink font-serif-bold text-[28px]" style={{ lineHeight: 32 }}>
        {value}
      </Text>
      <Text className="text-ink-muted font-sans-medium text-[10px] tracking-[1.5px] uppercase mt-1">
        {label}
      </Text>
    </View>
  );
}

function EmptyState() {
  const { colors } = useTheme();
  return (
    <View className="bg-paper-light rounded-3xl border border-rule mt-3 px-5 py-7 items-center">
      <View className="w-12 h-12 rounded-2xl bg-paper-deep items-center justify-center mb-3">
        <Ionicons name="paper-plane-outline" size={22} color={colors.terracotta} />
      </View>
      <Text className="text-ink font-serif-bold text-[17px] mb-1.5">
        Your timeline awaits.
      </Text>
      <Text className="text-ink-muted font-sans text-[13px] text-center leading-[18px] max-w-[260px]">
        Write something above and tap Publish.{"\n"}Your post will appear here when it goes out.
      </Text>
    </View>
  );
}

function PreviewRow({ activity }) {
  const { colors } = useTheme();
  const time = formatTime(activity.timestamp);
  return (
    <View className="bg-paper-light rounded-2xl border border-rule px-4 py-3 mb-2 flex-row items-start">
      <View className="w-7 h-7 rounded-full bg-paper-deep items-center justify-center mr-3 mt-0.5">
        <Ionicons
          name={activity.type === "post" ? "paper-plane" : "link"}
          size={12}
          color={colors.ink}
        />
      </View>
      <View className="flex-1">
        <Text className="text-ink font-sans-medium text-[14px] leading-[20px]" numberOfLines={2}>
          {activity.title}
        </Text>
        <Text className="text-ink-muted font-sans text-[11px] mt-1">
          {time} · {activity.platforms} {activity.platforms === 1 ? "platform" : "platforms"}
        </Text>
      </View>
    </View>
  );
}

function formatTime(ts) {
  const d = ts instanceof Date ? ts : new Date(ts);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}
