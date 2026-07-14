import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { useToast } from "./Toast";
import { teamAPI } from "../services/api";

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

  const load = useCallback(async (targetMonth) => {
    setLoading(true);
    try {
      const { data: res } = await teamAPI.performance(targetMonth);
      setData(res);
    } catch (err) {
      showToast({ type: "error", title: "Couldn't load performance", message: err.message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load(month);
  }, [month, load]);

  const totals = data?.totals || { published: 0, scheduled: 0, succeeded: 0, failed: 0 };
  const members = data?.members || [];
  const rate = totals.succeeded + totals.failed
    ? Math.round((totals.succeeded / (totals.succeeded + totals.failed)) * 100)
    : null;

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
          <Ionicons name="chevron-forward" size={20} color={month >= currentMonth() ? colors.inkSoft : colors.ink} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.olive} className="mt-6" />
      ) : (
        <>
          <View className="bg-paper-light border border-rule rounded-2xl p-4 mb-5 flex-row">
            <Stat value={totals.published} label="Published" color={colors.ink} />
            <Stat value={totals.scheduled} label="Scheduled" color={colors.info} />
            <Stat value={rate === null ? "—" : `${rate}%`} label="Success" color={colors.olive} />
          </View>

          <Text className="text-ink-soft text-[10px] tracking-[2px] uppercase font-sans-semibold ml-1 mb-2">
            By member
          </Text>
          {members.length === 0 ? (
            <Text className="text-ink-muted text-sm text-center mt-4">No activity this month.</Text>
          ) : (
            members.map((m) => (
              <View key={m.id} className="bg-paper-light border border-rule rounded-2xl px-4 py-3 mb-2">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-ink font-sans-bold text-sm">{m.name}</Text>
                  {m.role === "owner" ? (
                    <View className="bg-olive/15 rounded-full px-2 py-0.5">
                      <Text className="text-olive text-[10px] font-sans-bold">OWNER</Text>
                    </View>
                  ) : null}
                </View>
                <View className="flex-row">
                  <Stat value={m.published} label="Published" color={colors.ink} />
                  <Stat value={m.scheduled} label="Scheduled" color={colors.info} />
                  <Stat value={m.failed} label="Failed" color={colors.terracotta} />
                </View>
              </View>
            ))
          )}
        </>
      )}
    </View>
  );
}
