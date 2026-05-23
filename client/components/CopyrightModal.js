import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";

const RISK_CONFIG = {
  low: { color: getColors().olive, bg: "bg-paper-deep", border: "border-rule", icon: "information-circle", label: "Low Risk" },
  medium: { color: getColors().terracottaShadow, bg: "bg-paper-deep", border: "border-rule", icon: "warning", label: "Medium Risk" },
  high: { color: getColors().terracotta, bg: "bg-terracotta/20", border: "border-terracotta/40", icon: "alert-circle", label: "High Risk" },
};

const ISSUE_TYPE_LABELS = {
  lyrics: "Song Lyrics",
  quote: "Movie/TV Quote",
  trademark: "Trademark",
  text_copy: "Copied Text",
  watermark: "Watermark",
  stock_photo: "Stock Photo",
  character: "Copyrighted Character",
  logo: "Brand Logo",
  artwork: "Copyrighted Artwork",
  screenshot: "Screenshot",
  repost: "Reposted Content",
};

export default function CopyrightModal({
  visible,
  onClose,
  isChecking,
  result,
  onProceed,
  onEdit,
  onUseSafeVersion,
  onAddHashtag,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill} className="justify-end">
        <Pressable
          onPress={() => { if (!isChecking) onClose(); }}
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)" }]}
        />
        <View className="bg-paper-light rounded-t-3xl px-6 pt-5 pb-10 border-t border-rule">
          <View className="w-10 h-1 bg-paper-deep rounded-full self-center mb-5" />
          <View className="flex-row items-center mb-5">
            <Ionicons name="shield-checkmark" size={22} color={getColors().olive} />
            <Text className="text-ink text-lg font-serif-bold ml-2">Copyright Check</Text>
          </View>

          {isChecking && <CheckingState />}
          {!isChecking && result && !result.hasIssues && <ClearState onProceed={onProceed} />}
          {!isChecking && result?.hasIssues && (
            <IssuesState
              result={result}
              onProceed={onProceed}
              onEdit={onEdit}
              onUseSafeVersion={onUseSafeVersion}
              onAddHashtag={onAddHashtag}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function CheckingState() {
  return (
    <View className="bg-paper-deep rounded-2xl p-8 items-center">
      <ActivityIndicator color={getColors().olive} size="large" />
      <Text className="text-ink-muted text-sm mt-3">Analyzing your content...</Text>
      <Text className="text-ink-muted text-xs mt-1">Checking text and images for copyright issues</Text>
    </View>
  );
}

function ClearState({ onProceed }) {
  return (
    <View>
      <View className="bg-terracotta-soft/30 rounded-2xl p-5 items-center border border-terracotta/30 mb-4">
        <Ionicons name="checkmark-circle" size={48} color={getColors().terracotta} />
        <Text className="text-terracotta font-sans-bold text-base mt-3">All Clear!</Text>
        <Text className="text-ink-muted text-xs mt-1 text-center">No copyright issues detected</Text>
      </View>
      <TouchableOpacity onPress={onProceed} className="bg-terracotta py-3.5 rounded-xl items-center">
        <Text className="text-paper-light font-sans-bold text-sm">Continue to Post</Text>
      </TouchableOpacity>
    </View>
  );
}

function IssueItem({ issue }) {
  const severityStyles = {
    high: { bg: "bg-terracotta/20", text: "text-terracotta" },
    medium: { bg: "bg-paper-deep", text: "text-terracotta-shadow" },
    low: { bg: "bg-terracotta-soft/40", text: "text-terracotta" },
  };
  const s = severityStyles[issue.severity] || severityStyles.low;

  return (
    <View className="bg-paper-deep rounded-xl p-3.5 mb-2 border border-rule">
      <View className="flex-row items-center mb-2">
        <View className={`px-2 py-0.5 rounded-full ${s.bg}`}>
          <Text className={`text-xs font-sans-medium ${s.text}`}>
            {ISSUE_TYPE_LABELS[issue.type] || issue.type}
          </Text>
        </View>
        {issue.source && (
          <Text className="text-ink-muted text-xs ml-2 flex-1" numberOfLines={1}>{issue.source}</Text>
        )}
      </View>
      {issue.content && (
        <Text className="text-ink text-xs mb-1.5" numberOfLines={2}>&quot;{issue.content}&quot;</Text>
      )}
      <Text className="text-ink-muted text-xs">{issue.explanation}</Text>
    </View>
  );
}

function IssuesState({ result, onProceed, onEdit, onUseSafeVersion, onAddHashtag }) {
  const rc = RISK_CONFIG[result.riskLevel] || RISK_CONFIG.low;

  return (
    <ScrollView showsVerticalScrollIndicator nestedScrollEnabled style={{ maxHeight: 400 }}>
      <View className={`${rc.bg} ${rc.border} border rounded-2xl p-4 flex-row items-center mb-4`}>
        <Ionicons name={rc.icon} size={24} color={rc.color} />
        <View className="ml-3 flex-1">
          <Text style={{ color: rc.color }} className="font-sans-bold text-sm">{rc.label}</Text>
          <Text className="text-ink-muted text-xs mt-0.5">
            {result.issues.length} potential issue{result.issues.length !== 1 ? "s" : ""} found
          </Text>
        </View>
      </View>

      <Text className="text-ink-muted text-xs mb-2 font-sans-semibold">ISSUES DETECTED</Text>
      {result.issues.map((issue, i) => <IssueItem key={i} issue={issue} />)}

      {result.brandHashtags?.length > 0 && (
        <HashtagSection hashtags={result.brandHashtags} onAdd={onAddHashtag} />
      )}

      {result.suggestions?.length > 0 && <SuggestionsSection suggestions={result.suggestions} />}

      <ActionButtons
        safeVersion={result.safeVersion}
        riskLevel={result.riskLevel}
        onUseSafeVersion={onUseSafeVersion}
        onEdit={onEdit}
        onProceed={onProceed}
      />
    </ScrollView>
  );
}

function HashtagSection({ hashtags, onAdd }) {
  return (
    <View className="mt-3">
      <Text className="text-ink-muted text-xs mb-2 font-sans-semibold">BRAND HASHTAGS</Text>
      <View className="bg-paper-deep rounded-xl p-3.5 border border-rule">
        <Text className="text-ink-muted text-xs mb-2">Reference these brands with hashtags instead:</Text>
        <View className="flex-row flex-wrap">
          {hashtags.map((tag, i) => (
            <TouchableOpacity key={i} onPress={() => onAdd(tag)} className="bg-paper-deep rounded-full px-3 py-1.5 mr-2 mb-1.5">
              <Text className="text-olive text-xs font-sans-bold">{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function SuggestionsSection({ suggestions }) {
  return (
    <View className="mt-3">
      <Text className="text-ink-muted text-xs mb-2 font-sans-semibold">SUGGESTIONS</Text>
      <View className="bg-paper-deep rounded-xl p-3.5 border border-rule">
        {suggestions.map((s, i) => (
          <View key={i} className="flex-row mb-1.5">
            <Ionicons name="bulb-outline" size={14} color={getColors().olive} style={{ marginTop: 1 }} />
            <Text className="text-ink text-xs ml-2 flex-1">{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ActionButtons({ safeVersion, riskLevel, onUseSafeVersion, onEdit, onProceed }) {
  return (
    <View className="mt-3">
      {safeVersion && (
        <>
          <Text className="text-ink-muted text-xs mb-2 font-sans-semibold">SAFE VERSION</Text>
          <View className="bg-terracotta-soft/30 rounded-xl p-3.5 border border-terracotta/30 mb-4">
            <Text className="text-ink text-xs leading-5">{safeVersion}</Text>
          </View>
          <TouchableOpacity onPress={onUseSafeVersion} className="bg-terracotta py-3.5 rounded-xl items-center mb-2">
            <Text className="text-paper-light font-sans-bold text-sm">Use Safe Version</Text>
          </TouchableOpacity>
        </>
      )}
      <View className="flex-row">
        <TouchableOpacity onPress={onEdit} className="flex-1 bg-ink py-3.5 rounded-xl mr-2 items-center">
          <Text className="text-paper-light font-sans-bold text-sm">{safeVersion ? "Edit Myself" : "Edit Content"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onProceed} className="flex-1 bg-paper-deep py-3.5 rounded-xl border border-rule items-center">
          <Text className="text-ink font-sans-bold text-sm">Post Anyway</Text>
        </TouchableOpacity>
      </View>
      {riskLevel === "high" && (
        <Text className="text-terracotta text-xs text-center mt-2">
          Posting copyrighted content may result in account strikes or takedowns
        </Text>
      )}
    </View>
  );
}
