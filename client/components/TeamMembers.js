import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { useToast } from "./Toast";
import { teamAPI } from "../services/api";

function MemberRow({ member, onRemove }) {
  const initial = (member.name || member.email || "?").charAt(0).toUpperCase();
  return (
    <View className="flex-row items-center bg-paper-light border border-rule rounded-2xl px-4 py-3 mb-2">
      <View className="w-10 h-10 rounded-full bg-oliveSoft/40 items-center justify-center mr-3">
        <Text className="text-olive font-serif-bold">{initial}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-ink font-sans-bold text-sm">{member.name}</Text>
        <Text className="text-ink-muted text-[11px]">{member.email}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemove(member)} className="p-2">
        <Ionicons name="trash-outline" size={18} color={getColors().terracotta} />
      </TouchableOpacity>
    </View>
  );
}

export default function TeamMembers() {
  const { showToast } = useToast();
  const colors = getColors();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await teamAPI.listMembers();
      setMembers(data.members || []);
    } catch (err) {
      showToast({ type: "error", title: "Couldn't load team", message: err.message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const addMember = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      showToast({ type: "warning", title: "Fill everything", message: "Name, email and a 6+ char password." });
      return;
    }
    setSubmitting(true);
    try {
      await teamAPI.addMember(form.name.trim(), form.email.trim(), form.password);
      setForm({ name: "", email: "", password: "" });
      showToast({ type: "success", title: "Member added", message: "Share the email and password with them." });
      load();
    } catch (err) {
      showToast({ type: "error", title: "Couldn't add member", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const removeMember = (member) => {
    Alert.alert("Remove member?", `${member.name} will lose access to your workspace.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await teamAPI.removeMember(member.id);
            showToast({ type: "success", title: "Member removed" });
            load();
          } catch (err) {
            showToast({ type: "error", title: "Couldn't remove", message: err.message });
          }
        },
      },
    ]);
  };

  return (
    <View>
      <View className="bg-paper-light border border-rule rounded-2xl p-4 mb-5">
        <Text className="text-ink font-sans-bold text-sm mb-3">Invite a worker</Text>
        <TextInput
          value={form.name}
          onChangeText={(name) => setForm((f) => ({ ...f, name }))}
          placeholder="Full name"
          placeholderTextColor={colors.inkSoft}
          className="bg-paper border border-rule rounded-xl px-4 py-3 text-ink text-sm mb-2"
        />
        <TextInput
          value={form.email}
          onChangeText={(email) => setForm((f) => ({ ...f, email }))}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={colors.inkSoft}
          className="bg-paper border border-rule rounded-xl px-4 py-3 text-ink text-sm mb-2"
        />
        <TextInput
          value={form.password}
          onChangeText={(password) => setForm((f) => ({ ...f, password }))}
          placeholder="Temporary password (6+ chars)"
          autoCapitalize="none"
          placeholderTextColor={colors.inkSoft}
          className="bg-paper border border-rule rounded-xl px-4 py-3 text-ink text-sm mb-3"
        />
        <TouchableOpacity
          onPress={addMember}
          disabled={submitting}
          className={`py-3 rounded-xl items-center ${submitting ? "bg-olive/40" : "bg-olive"}`}
        >
          {submitting ? (
            <ActivityIndicator color={colors.paperLight} />
          ) : (
            <Text className="text-paper-light font-sans-bold text-sm">Add member</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text className="text-ink-soft text-[10px] tracking-[2px] uppercase font-sans-semibold ml-1 mb-2">
        Members ({members.length})
      </Text>
      {loading ? (
        <ActivityIndicator color={colors.olive} className="mt-4" />
      ) : members.length === 0 ? (
        <Text className="text-ink-muted text-sm text-center mt-4">
          No members yet. Add a worker above.
        </Text>
      ) : (
        members.map((m) => <MemberRow key={m.id} member={m} onRemove={removeMember} />)
      )}
    </View>
  );
}
