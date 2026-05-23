import { useState } from "react";
import { getColors } from "../constants/theme";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "./Toast";
import { authAPI } from "../services/api";

export default function EditProfile({ user, onBack, onUpdateUser }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      showToast({
        type: "error",
        title: "Required",
        message: "Name and email are required.",
      });
      return;
    }
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(name.trim(), email.trim());
      onUpdateUser(data.user);
      showToast({ type: "success", title: "Profile updated" });
      onBack();
    } catch (err) {
      showToast({
        type: "error",
        title: "Update failed",
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-paper px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={getColors().ink} />
        </TouchableOpacity>
        <Text className="text-ink text-xl font-serif-bold">Edit Profile</Text>
      </View>
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-terracotta-soft/40 items-center justify-center mb-3">
          <Ionicons name="person" size={36} color={getColors().terracotta} />
        </View>
        <Text className="text-ink-muted text-sm">{user?.email}</Text>
      </View>

      <Text className="text-ink-muted text-xs mb-2 ml-1">FULL NAME</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={getColors().inkMuted}
        className="bg-paper-light border border-rule rounded-xl px-4 py-3.5 text-ink mb-5"
      />

      <Text className="text-ink-muted text-xs mb-2 ml-1">EMAIL ADDRESS</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Your email"
        placeholderTextColor={getColors().inkMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        className="bg-paper-light border border-rule rounded-xl px-4 py-3.5 text-ink mb-8"
      />

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className={`py-4 rounded-xl ${saving ? "bg-terracotta/50" : "bg-terracotta"}`}
      >
        {saving ? (
          <ActivityIndicator color={getColors().paperLight} />
        ) : (
          <Text className="text-paper-light text-center font-sans-bold">
            Save Changes
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
