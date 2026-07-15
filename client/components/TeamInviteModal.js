import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";

export default function TeamInviteModal({ visible, invite, busy, onAccept, onReject }) {
  const colors = getColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-ink/60 px-6">
        <View className="bg-paper-light rounded-3xl border border-rule p-6 w-full max-w-sm">
          <View className="w-14 h-14 rounded-2xl bg-oliveSoft/40 items-center justify-center mb-4 self-center">
            <Ionicons name="people" size={26} color={colors.olive} />
          </View>
          <Text className="text-ink text-xl font-serif-bold text-center mb-2">
            Team invitation
          </Text>
          <Text className="text-ink-muted text-sm text-center leading-5 mb-6">
            <Text className="text-ink font-sans-bold">{invite?.ownerName}</Text> invited you to
            their workspace. Accept to post through their connected social accounts. Your posts
            stay yours.
          </Text>

          <TouchableOpacity
            onPress={onAccept}
            disabled={busy}
            className={`py-3.5 rounded-xl items-center mb-2 ${busy ? "bg-olive/40" : "bg-olive"}`}
          >
            {busy ? (
              <ActivityIndicator color={colors.paperLight} />
            ) : (
              <Text className="text-paper-light font-sans-bold text-sm">Accept & join</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReject}
            disabled={busy}
            className="py-3 rounded-xl items-center border border-rule"
          >
            <Text className="text-ink-muted font-sans-semibold text-sm">Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
