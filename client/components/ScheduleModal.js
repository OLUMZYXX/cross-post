import { useState } from "react";
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
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-black/60 justify-end">
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View className="bg-gray-900 rounded-t-3xl px-6 pt-5 pb-10 border-t border-gray-800">
            <View className="w-10 h-1 bg-gray-700 rounded-full self-center mb-6" />
            <Text className="text-white text-lg font-bold mb-6">When do you want to post?</Text>

            <TouchableOpacity onPress={onPostNow} className="flex-row items-center bg-green-500 rounded-2xl p-4 mb-3">
              <View className="w-10 h-10 rounded-full bg-green-600 items-center justify-center mr-4">
                <Ionicons name="send" size={18} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-950 font-bold text-base">Post Now</Text>
                <Text className="text-green-900 text-xs">Publish immediately to all platforms</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#14532d" />
            </TouchableOpacity>

            <View className="bg-gray-800 rounded-2xl p-4">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={18} color="#60a5fa" />
                </View>
                <Text className="text-white font-bold text-base">Schedule for Later</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ paddingRight: 8 }}>
                {dateChips.map((chip, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDateIdx(i)}
                    className={`mr-2 px-4 py-2 rounded-full border ${
                      selectedDateIdx === i ? "bg-blue-500/20 border-blue-500" : "bg-gray-700 border-gray-600"
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${selectedDateIdx === i ? "text-blue-400" : "text-gray-400"}`}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="flex-row items-center justify-center mb-4">
                <TimeColumn value={pad(hour)} onUp={() => adjustHour(1)} onDown={() => adjustHour(-1)} />
                <Text className="text-white text-2xl font-bold mx-2">:</Text>
                <TimeColumn value={pad(minute)} onUp={() => adjustMinute(5)} onDown={() => adjustMinute(-5)} />
                <View className="ml-3 bg-gray-700 rounded-xl overflow-hidden">
                  {["AM", "PM"].map((period) => (
                    <TouchableOpacity
                      key={period}
                      onPress={() => setAmpm(period)}
                      className={`px-4 py-3 ${ampm === period ? "bg-blue-500" : ""}`}
                    >
                      <Text className={`text-sm font-bold ${ampm === period ? "text-white" : "text-gray-400"}`}>
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleConfirmSchedule}
                disabled={isPast}
                className={`py-3 rounded-xl items-center ${isPast ? "bg-gray-700" : "bg-blue-500"}`}
              >
                <Text className={`font-bold text-sm ${isPast ? "text-gray-500" : "text-white"}`}>
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
        <Ionicons name="chevron-up" size={20} color="#9ca3af" />
      </TouchableOpacity>
      <View className="bg-gray-700 rounded-xl w-14 h-12 items-center justify-center">
        <Text className="text-white text-xl font-bold">{value}</Text>
      </View>
      <TouchableOpacity onPress={onDown} className="w-10 h-10 items-center justify-center">
        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
}
