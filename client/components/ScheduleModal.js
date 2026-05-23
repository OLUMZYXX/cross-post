import { useState } from "react";
import { getColors } from "../constants/theme";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function pad(n) {
  return String(n).padStart(2, "0");
}

function buildDateChips() {
  const chips = [];
  const now = new Date();
  const labels = ["Today", "Tomorrow"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    chips.push({
      label:
        labels[i] ||
        d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      date: d,
    });
  }
  return chips;
}

export default function ScheduleModal({ visible, onClose, onPostNow, onSchedule }) {
  const dateChips = buildDateChips();
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState("PM");

  const adjustHour = (delta) => {
    setHour((h) => {
      let next = h + delta;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      return next;
    });
  };

  const adjustMinute = (delta) => {
    setMinute((m) => {
      let next = m + delta;
      if (next < 0) next = 55;
      if (next > 55) next = 0;
      return next;
    });
  };

  const scheduledDate = (() => {
    const base = new Date(dateChips[selectedDateIdx].date);
    let h = hour;
    if (ampm === "AM" && h === 12) h = 0;
    if (ampm === "PM" && h !== 12) h += 12;
    base.setHours(h, minute, 0, 0);
    return base;
  })();
  const isPast = scheduledDate <= new Date();

  const handleConfirmSchedule = () => {
    if (isPast) return;
    const label = scheduledDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    onSchedule(scheduledDate, label);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-ink/60 justify-end">
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View className="bg-paper-light rounded-t-3xl px-6 pt-5 pb-10 border-t border-rule">
            <View className="w-10 h-1 bg-paper-deep rounded-full self-center mb-6" />
            <Text className="text-ink text-lg font-serif-bold mb-6">When do you want to post?</Text>

            <TouchableOpacity onPress={onPostNow} className="flex-row items-center bg-terracotta rounded-2xl p-4 mb-3">
              <View className="w-10 h-10 rounded-full bg-terracotta-shadow items-center justify-center mr-4">
                <Ionicons name="send" size={18} color={getColors().paperLight} />
              </View>
              <View className="flex-1">
                <Text className="text-paper-light font-sans-bold text-base">Post Now</Text>
                <Text className="text-paper-light text-xs opacity-80">Publish immediately to all platforms</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={getColors().paperLight} />
            </TouchableOpacity>

            <View className="bg-paper rounded-2xl p-4 border border-rule">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-paper-deep items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={18} color={getColors().ink} />
                </View>
                <Text className="text-ink font-sans-bold text-base">Schedule for Later</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ paddingRight: 8 }}>
                {dateChips.map((chip, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDateIdx(i)}
                    className={`mr-2 px-4 py-2 rounded-full border ${
                      selectedDateIdx === i ? "bg-ink border-ink" : "bg-paper-light border-rule"
                    }`}
                  >
                    <Text className={`text-xs font-sans-semibold ${selectedDateIdx === i ? "text-paper-light" : "text-ink"}`}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="flex-row items-center justify-center mb-4">
                <TimeColumn value={pad(hour)} onUp={() => adjustHour(1)} onDown={() => adjustHour(-1)} />
                <Text className="text-ink text-2xl font-serif-bold mx-2">:</Text>
                <TimeColumn value={pad(minute)} onUp={() => adjustMinute(5)} onDown={() => adjustMinute(-5)} />
                <View className="ml-3 bg-paper-light rounded-xl overflow-hidden border border-rule">
                  {["AM", "PM"].map((period) => (
                    <TouchableOpacity
                      key={period}
                      onPress={() => setAmpm(period)}
                      className={`px-4 py-3 ${ampm === period ? "bg-ink" : ""}`}
                    >
                      <Text className={`text-sm font-sans-bold ${ampm === period ? "text-paper-light" : "text-ink-muted"}`}>
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleConfirmSchedule}
                disabled={isPast}
                className={`py-3 rounded-xl items-center ${isPast ? "bg-paper-deep" : "bg-ink"}`}
              >
                <Text className={`font-sans-bold text-sm ${isPast ? "text-ink-muted" : "text-paper-light"}`}>
                  {isPast
                    ? "Pick a future time"
                    : `Schedule · ${scheduledDate.toLocaleString("en-US", {
                        weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                      })}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function TimeColumn({ value, onUp, onDown }) {
  return (
    <View className="items-center">
      <TouchableOpacity onPress={onUp} className="w-10 h-10 items-center justify-center">
        <Ionicons name="chevron-up" size={20} color={getColors().inkMuted} />
      </TouchableOpacity>
      <View className="bg-paper-deep rounded-xl w-14 h-12 items-center justify-center">
        <Text className="text-ink text-xl font-serif-bold">{value}</Text>
      </View>
      <TouchableOpacity onPress={onDown} className="w-10 h-10 items-center justify-center">
        <Ionicons name="chevron-down" size={20} color={getColors().inkMuted} />
      </TouchableOpacity>
    </View>
  );
}
