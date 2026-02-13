import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "./Toast";

export default function PrivacySecurity({ onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({ type: "error", title: "Required", message: "All fields are required." });
      return;
    }
    if (newPassword.length < 6) {
      showToast({ type: "error", title: "Too short", message: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: "error", title: "Mismatch", message: "Passwords do not match." });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast({ type: "info", title: "Coming soon", message: "Password change will be available soon." });
    }, 1000);
  };

  return (
    <View className="flex-1 bg-gray-950 px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Privacy & Security</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-gray-400 text-xs mb-3 ml-1">CHANGE PASSWORD</Text>
        <View className="bg-gray-900/80 rounded-2xl border border-gray-800 p-4 mb-6">
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor="#6b7280"
            secureTextEntry={!showPassword}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-3"
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor="#6b7280"
            secureTextEntry={!showPassword}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-3"
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#6b7280"
            secureTextEntry={!showPassword}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-3"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="mb-4">
            <Text className="text-green-400 text-xs">
              {showPassword ? "Hide passwords" : "Show passwords"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={saving}
            className={`py-3 rounded-xl ${saving ? "bg-green-500/50" : "bg-green-500"}`}
          >
            {saving ? (
              <ActivityIndicator color="#030712" />
            ) : (
              <Text className="text-gray-950 text-center font-bold text-sm">Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-gray-400 text-xs mb-3 ml-1">ACCOUNT</Text>
        <View className="bg-gray-900/80 rounded-2xl border border-gray-800">
          <View className="flex-row items-center p-4 border-b border-gray-800">
            <Ionicons name="shield-checkmark-outline" size={18} color="#4ade80" />
            <Text className="text-white text-sm ml-3 flex-1">Two-Factor Authentication</Text>
            <Text className="text-yellow-400 text-xs">Coming soon</Text>
          </View>
          <View className="flex-row items-center p-4">
            <Ionicons name="eye-off-outline" size={18} color="#a855f7" />
            <Text className="text-white text-sm ml-3 flex-1">Private Account</Text>
            <Text className="text-yellow-400 text-xs">Coming soon</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
