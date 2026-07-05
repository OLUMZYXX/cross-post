import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { useToast } from "./Toast";
import { scorecardAPI } from "../services/api";

const SPORTSDB_SEARCH = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php";

function useTeamSearch(query, active) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!active || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${SPORTSDB_SEARCH}?t=${encodeURIComponent(query.trim())}`,
        );
        const data = await res.json();
        const teams = (data?.teams || [])
          .filter((t) => t.strSport === "Soccer")
          .slice(0, 6)
          .map((t) => ({
            name: t.strTeam,
            badge: t.strTeamBadge || t.strBadge || null,
            country: t.strCountry || null,
          }));
        if (!cancelled) setSuggestions(teams);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, active]);

  return [suggestions, setSuggestions];
}

function TeamRow({ label, team, setTeam, score, setScore, active, setActive, colors }) {
  const [suggestions, setSuggestions] = useTeamSearch(team, active);

  return (
    <View className="mb-4">
      <Text className="text-ink-muted text-xs mb-2 ml-1">{label}</Text>
      <View className="flex-row gap-2">
        <TextInput
          value={team}
          onChangeText={setTeam}
          onFocus={() => setActive(true)}
          placeholder="Team or country"
          placeholderTextColor={colors.inkSoft}
          autoCorrect={false}
          className="flex-1 bg-paper-deep border border-rule rounded-xl px-4 py-3 text-ink"
        />
        <TextInput
          value={score}
          onChangeText={setScore}
          placeholder="0"
          placeholderTextColor={colors.inkSoft}
          keyboardType="number-pad"
          maxLength={2}
          className="w-16 bg-paper-deep border border-rule rounded-xl px-4 py-3 text-ink text-center"
        />
      </View>
      {active && suggestions.length > 0 && (
        <View className="bg-paper-light border border-rule rounded-xl mt-1 overflow-hidden">
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={`${s.name}-${i}`}
              onPress={() => {
                setTeam(s.name);
                setSuggestions([]);
                setActive(false);
              }}
              className={`flex-row items-center px-3 py-2.5 ${i < suggestions.length - 1 ? "border-b border-rule" : ""}`}
            >
              {s.badge ? (
                <Image source={{ uri: s.badge }} className="w-6 h-6 rounded-full mr-3" />
              ) : (
                <View className="w-6 h-6 rounded-full bg-paper-deep mr-3" />
              )}
              <Text className="text-ink text-sm flex-1" numberOfLines={1}>{s.name}</Text>
              {s.country ? <Text className="text-ink-soft text-[10px]">{s.country}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ScorecardModal({ visible, onClose, baseImageUrl, onApply }) {
  const { showToast } = useToast();
  const colors = getColors();
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!baseImageUrl) {
      showToast({ type: "warning", title: "Add a photo", message: "Attach a match image first." });
      return;
    }
    if (homeScore === "" || awayScore === "") {
      showToast({ type: "warning", title: "Enter scores", message: "Both scores are required." });
      return;
    }
    setApplying(true);
    try {
      const { data } = await scorecardAPI.compose({
        imageUrl: baseImageUrl,
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        homeScore: homeScore.trim(),
        awayScore: awayScore.trim(),
      });
      if (!data.homeBadgeFound || !data.awayBadgeFound) {
        showToast({ type: "info", title: "Some badges missing", message: "Check the team spelling for missing crests." });
      }
      onApply(data.url);
      showToast({ type: "success", title: "Scorecard applied", message: "Added to your post." });
      onClose();
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-1 justify-end bg-ink/60">
          <View className="bg-paper rounded-t-3xl px-6 pt-5 pb-8 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-ink text-xl font-serif-bold">Full-Time Scorecard</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>
            <Text className="text-ink-muted text-xs mb-5">
              Type a team to auto-fill the correct name and badge.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TeamRow
                label="HOME"
                team={homeTeam}
                setTeam={setHomeTeam}
                score={homeScore}
                setScore={setHomeScore}
                active={activeField === "home"}
                setActive={(v) => setActiveField(v ? "home" : null)}
                colors={colors}
              />
              <TeamRow
                label="AWAY"
                team={awayTeam}
                setTeam={setAwayTeam}
                score={awayScore}
                setScore={setAwayScore}
                active={activeField === "away"}
                setActive={(v) => setActiveField(v ? "away" : null)}
                colors={colors}
              />

              <TouchableOpacity
                onPress={handleApply}
                disabled={applying}
                className={`py-3.5 rounded-xl mt-3 ${applying ? "bg-olive/40" : "bg-olive"}`}
              >
                {applying ? (
                  <ActivityIndicator color={colors.paperLight} />
                ) : (
                  <Text className="text-paper-light text-center font-sans-bold text-sm">Apply scorecard</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
