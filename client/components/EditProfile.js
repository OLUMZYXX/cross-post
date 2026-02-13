import { useState } from "react";
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
      showToast({ type: "error", title: "Required", message: "Name and email are required." });
      return;
    }
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(name.trim(), email.trim());
      onUpdateUser(data.user);
      showToast({ type: "success", title: "Profile updated" });
      onBack();
    } catch (err) {
      showToast({ type: "error", title: "Update failed", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-950 px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Edit Profile</Text>
      </View>

      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-green-500/20 items-center justify-center mb-3">
          <Ionicons name="person" size={36} color="#4ade80" />
        </View>
        <Text className="text-gray-400 text-sm">
          {user?.email}
        </Text>
      </View>

      <Text className="text-gray-400 text-xs mb-2 ml-1">FULL NAME</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor="#6b7280"
        className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white mb-5"
      />

      <Text className="text-gray-400 text-xs mb-2 ml-1">EMAIL ADDRESS</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Your email"
        placeholderTextColor="#6b7280"
        keyboardType="email-address"
        autoCapitalize="none"
        className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white mb-8"
      />

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className={`py-4 rounded-xl ${saving ? "bg-green-500/50" : "bg-green-500"}`}
      >
        {saving ? (
          <ActivityIndicator color="#030712" />
        ) : (
          <Text className="text-gray-950 text-center font-bold">Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
