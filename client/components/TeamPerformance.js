import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { useToast } from "./Toast";
import { teamAPI } from "../services/api";
import TeamMemberCard from "./TeamMemberCard";
import TeamMemberAnalytics from "./TeamMemberAnalytics";
import PostingBarChart from "./PostingBarChart";

function monthLabel(month) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

function shiftMonth(month, delta) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function Stat({ value, label, color }) {
  return (
    <View className="flex-1">
      <Text className="font-serif-bold text-2xl" style={{ color }}>{value}</Text>
      <Text className="text-ink-muted text-[10px] tracking-[1px] uppercase mt-0.5">{label}</Text>
    </View>
  );
}

export default function TeamPerformance() {
  const { showToast } = useToast();
  const colors = getColors();
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(
    async (targetMonth) => {
      setLoading(true);
      try {
        const { data: res } = await teamAPI.performance(targetMonth);
        setData(res);
      } catch (err) {
        showToast({ type: "error", title: "Couldn't load performance", message: err.message });
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    load(month);
  }, [month, load]);

  const totals = data?.totals || {};
  const members = data?.members || [];
  const ranked = members.filter((m) => m.rank);
  const topPlatforms = Object.entries(data?.topPlatforms || {}).sort((a, b) => b[1] - a[1]);
  const teamDaily = (members[0]?.daily || []).map((d, i) => ({
    key: d.day,
    label: String(d.day),
    count: members.reduce((sum, m) => sum + (m.daily?.[i]?.count || 0), 0),
  }));
  const teamWeekly = (members[0]?.weekly || []).map((w, i) => ({
    label: w.label,
    count: members.reduce((sum, m) => sum + (m.weekly?.[i]?.count || 0), 0),
  }));
  const isCurrent = month >= currentMonth();

  if (selected) {
    const fresh = members.find((m) => m.id === selected.id) || selected;
    return (
      <TeamMemberAnalytics member={fresh} month={month} onBack={() => setSelected(null)} />
    );
  }

  return (
    <View>
      <View className="flex-row items-center justify-between bg-paper-light border border-rule rounded-2xl px-3 py-2 mb-4">
        <TouchableOpacity onPress={() => setMonth((m) => shiftMonth(m, -1))} className="p-2">
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text className="text-ink font-sans-bold text-sm">{monthLabel(month)}</Text>
        <TouchableOpacity
          onPress={() => setMonth((m) => (m >= currentMonth() ? m : shiftMonth(m, 1)))}
          className="p-2"
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isCurrent ? colors.inkSoft : colors.ink}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.olive} className="mt-6" />
      ) : (
        <>
          <View className="bg-paper-light border border-rule rounded-2xl p-4 mb-2 flex-row">
            <Stat value={totals.published || 0} label="Published" color={colors.ink} />
            <Stat value={totals.scheduled || 0} label="Scheduled" color={colors.info} />
            <Stat
              value={totals.successRate === null || totals.successRate === undefined ? "—" : `${totals.successRate}%`}
              label="Success"
              color={colors.olive}
            />
            <Stat
              value={totals.activeMembers || 0}
              label="Active"
              color={colors.terracotta}
            />
          </View>

          {totals.failed > 0 ? (
            <View className="flex-row items-center bg-terracotta-soft/25 border border-terracotta/30 rounded-2xl px-4 py-2.5 mb-2">
              <Ionicons name="alert-circle" size={15} color={colors.terracotta} />
              <Text className="text-ink-muted text-[11px] ml-2 flex-1">
                {totals.failed} failed delivery{totals.failed === 1 ? "" : "ies"} this month
              </Text>
            </View>
          ) : null}

          <PostingBarChart data={teamDaily} title="TEAM POSTS PER DAY" caption="Day of month" />

          <PostingBarChart data={teamWeekly} title="TEAM WEEKLY ACTIVITY" labelMode="all" />

          {topPlatforms.length > 0 && (
            <View className="bg-paper-light border border-rule rounded-2xl px-4 py-3 mb-5">
              <Text className="text-ink-soft text-[9px] tracking-[1.5px] uppercase mb-2">
                Where the team posted
              </Text>
              <View className="flex-row flex-wrap">
                {topPlatforms.map(([name, count]) => (
                  <View key={name} className="flex-row items-center mr-4 mb-1">
                    <Text className="text-ink font-sans-bold text-sm">{count}</Text>
                    <Text className="text-ink-muted text-[11px] ml-1.5">{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text className="text-ink-soft text-[10px] tracking-[2px] uppercase font-sans-semibold ml-1 mb-2">
            Ranking ({ranked.length})
          </Text>
          {members.length === 0 ? (
            <Text className="text-ink-muted text-sm text-center mt-4">No activity this month.</Text>
          ) : (
            members.map((member) => (
              <TeamMemberCard key={member.id} member={member} onPress={setSelected} />
            ))
          )}
        </>
      )}
    </View>
  );
}
