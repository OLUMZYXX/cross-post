import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";

export default function DeleteAccountModal({
  visible,
  onClose,
  hasPassword,
  submitting,
  onConfirm,
}) {
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const reset = () => {
    setConfirmText("");
    setPassword("");
    setShowPassword(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const confirmed = confirmText.trim().toUpperCase() === "DELETE";
  const canSubmit = confirmed && (!hasPassword || password.length > 0);

  const handleConfirm = () => {
    if (!canSubmit || submitting) return;
    onConfirm({ password, confirmText });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1 justify-center items-center bg-ink/60 px-6">
            <View className="bg-paper-light rounded-3xl p-6 w-full max-w-sm">
              <View className="items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-terracotta/15 items-center justify-center mb-3">
                  <Ionicons name="warning" size={24} color={getColors().terracotta} />
                </View>
                <Text className="text-ink text-lg font-serif-bold">
                  Delete Account
                </Text>
              </View>

              <Text className="text-ink-muted text-xs text-center mb-5 leading-5">
                This permanently deletes your account, posts, and connected
                accounts. This action cannot be undone.
              </Text>

              <Text className="text-ink-muted text-xs mb-2">
                Type <Text className="text-terracotta font-sans-bold">DELETE</Text> to confirm:
              </Text>
              <TextInput
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="DELETE"
                placeholderTextColor={getColors().inkMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                className="bg-paper-deep border border-rule rounded-xl px-4 py-3 text-ink mb-4"
              />

              <Text className="text-ink-muted text-xs mb-2">
                {hasPassword
                  ? "Enter your account password:"
                  : "Account password (leave blank if you signed in with Google or Apple):"}
              </Text>
              <View className="flex-row items-center bg-paper-deep border border-rule rounded-xl mb-2">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={getColors().inkMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="flex-1 px-4 py-3 text-ink"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  className="px-4"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={getColors().inkMuted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={!canSubmit || submitting}
                className={`py-3.5 rounded-xl mt-3 mb-3 ${
                  canSubmit && !submitting ? "bg-terracotta" : "bg-terracotta/40"
                }`}
              >
                {submitting ? (
                  <ActivityIndicator color={getColors().paperLight} />
                ) : (
                  <Text className="text-paper-light text-center font-sans-bold text-sm">
                    Delete My Account
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                disabled={submitting}
                className="py-3 rounded-xl bg-paper-deep"
              >
                <Text className="text-ink text-center text-sm">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
