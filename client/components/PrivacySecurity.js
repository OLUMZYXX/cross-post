import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "./Toast";
import { authAPI } from "../services/api";

const BIOMETRIC_KEY = "@crosspost_biometric_enabled";

export default function PrivacySecurity({ onBack, user }) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.twoFactorEnabled || false,
  );
  const [setting2FA, setSetting2FA] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [disabling2FA, setDisabling2FA] = useState(false);

  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);

    if (compatible && enrolled) {
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasFace = types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      );
      const hasFingerprint = types.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      );

      if (Platform.OS === "ios") {
        setBiometricType(hasFace ? "Face ID" : hasFingerprint ? "Touch ID" : "Biometric");
      } else {
        setBiometricType(hasFingerprint ? "Fingerprint" : hasFace ? "Face Unlock" : "Biometric");
      }
    }

    const stored = await AsyncStorage.getItem(BIOMETRIC_KEY);
    setBiometricEnabled(stored === "true");
  };

  const toggleBiometric = async (value) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric lock",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (!result.success) {
        showToast({
          type: "error",
          title: "Authentication failed",
          message: "Could not verify your identity.",
        });
        return;
      }
    }

    await AsyncStorage.setItem(BIOMETRIC_KEY, value ? "true" : "false");
    setBiometricEnabled(value);
    showToast({
      type: "success",
      title: value ? `${biometricType} enabled` : `${biometricType} disabled`,
      message: value
        ? "You'll need to authenticate when opening the app."
        : "Biometric lock has been turned off.",
    });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({
        type: "error",
        title: "Required",
        message: "All fields are required.",
      });
      return;
    }
    if (newPassword.length < 6) {
      showToast({
        type: "error",
        title: "Too short",
        message: "Password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({
        type: "error",
        title: "Mismatch",
        message: "Passwords do not match.",
      });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast({
        type: "info",
        title: "Coming soon",
        message: "Password change will be available soon.",
      });
    }, 1000);
  };

  const handleEnable2FA = async () => {
    setSetting2FA(true);
    try {
      const { data } = await authAPI.setup2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setOtpCode("");
      setQrModalVisible(true);
    } catch (err) {
      showToast({
        type: "error",
        title: "Setup failed",
        message: err.message,
      });
    } finally {
      setSetting2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (otpCode.length !== 6) {
      showToast({
        type: "warning",
        title: "Invalid code",
        message: "Enter the 6-digit code from your authenticator app.",
      });
      return;
    }
    setVerifying2FA(true);
    try {
      await authAPI.verify2FA(otpCode);
      setTwoFactorEnabled(true);
      setQrModalVisible(false);
      setQrCode(null);
      setSecret(null);
      setOtpCode("");
      showToast({
        type: "success",
        title: "2FA enabled",
        message:
          "Two-factor authentication is now active on your account.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Verification failed",
        message: err.message,
      });
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (disableCode.length !== 6) {
      showToast({
        type: "warning",
        title: "Invalid code",
        message: "Enter the 6-digit code from your authenticator app.",
      });
      return;
    }
    setDisabling2FA(true);
    try {
      await authAPI.disable2FA(disableCode);
      setTwoFactorEnabled(false);
      setDisableModalVisible(false);
      setDisableCode("");
      showToast({
        type: "success",
        title: "2FA disabled",
        message: "Two-factor authentication has been turned off.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Failed",
        message: err.message,
      });
    } finally {
      setDisabling2FA(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-950 px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">
          Privacy & Security
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Change Password */}
        <Text className="text-gray-400 text-xs mb-3 ml-1">
          CHANGE PASSWORD
        </Text>
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
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="mb-4"
          >
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
              <Text className="text-gray-950 text-center font-bold text-sm">
                Update Password
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Two-Factor Authentication */}
        <Text className="text-gray-400 text-xs mb-3 ml-1">
          TWO-FACTOR AUTHENTICATION
        </Text>
        <View className="bg-gray-900/80 rounded-2xl border border-gray-800 p-4 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center mr-3">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#4ade80"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">
                Authenticator App
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {twoFactorEnabled
                  ? "Enabled — code required at login"
                  : "Add an extra layer of security"}
              </Text>
            </View>
          </View>

          {twoFactorEnabled ? (
            <TouchableOpacity
              onPress={() => {
                setDisableCode("");
                setDisableModalVisible(true);
              }}
              className="bg-red-500/10 py-3 rounded-xl border border-red-500/20"
            >
              <Text className="text-red-400 text-center font-bold text-sm">
                Disable 2FA
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleEnable2FA}
              disabled={setting2FA}
              className={`py-3 rounded-xl ${setting2FA ? "bg-green-500/50" : "bg-green-500"}`}
            >
              {setting2FA ? (
                <ActivityIndicator color="#030712" />
              ) : (
                <Text className="text-gray-950 text-center font-bold text-sm">
                  Enable 2FA
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Biometric Authentication */}
        <Text className="text-gray-400 text-xs mb-3 ml-1">APP LOCK</Text>
        <View className="bg-gray-900/80 rounded-2xl border border-gray-800 p-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center mr-3">
              <Ionicons
                name={
                  biometricType === "Face ID" || biometricType === "Face Unlock"
                    ? "scan-outline"
                    : "finger-print-outline"
                }
                size={20}
                color="#a855f7"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">
                {biometricType || "Biometric Lock"}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {biometricAvailable
                  ? `Require ${biometricType || "biometric"} to open the app`
                  : Platform.OS === "ios"
                    ? "Face ID is not set up on this device"
                    : "Fingerprint is not set up on this device"}
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              disabled={!biometricAvailable}
              trackColor={{ false: "#374151", true: "#4ade80" }}
              thumbColor={biometricEnabled ? "#fff" : "#9ca3af"}
            />
          </View>
        </View>

        {/* Account */}
        <Text className="text-gray-400 text-xs mb-3 ml-1">ACCOUNT</Text>
        <View className="bg-gray-900/80 rounded-2xl border border-gray-800">
          <View className="flex-row items-center p-4">
            <Ionicons name="eye-off-outline" size={18} color="#a855f7" />
            <Text className="text-white text-sm ml-3 flex-1">
              Private Account
            </Text>
            <Text className="text-yellow-400 text-xs">Coming soon</Text>
          </View>
        </View>
      </ScrollView>

      {/* 2FA Setup Modal (QR Code) */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-white text-lg font-bold mb-2">
              Set Up 2FA
            </Text>
            <Text className="text-gray-400 text-xs mb-4">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.)
            </Text>

            {qrCode && (
              <View className="items-center mb-4">
                <View className="bg-white rounded-2xl p-3">
                  <Image
                    source={{ uri: qrCode }}
                    style={{ width: 200, height: 200 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}

            {secret && (
              <View className="bg-gray-800 rounded-xl p-3 mb-4">
                <Text className="text-gray-400 text-xs mb-1">
                  Or enter this code manually:
                </Text>
                <Text
                  className="text-green-400 text-sm font-bold"
                  selectable
                >
                  {secret}
                </Text>
              </View>
            )}

            <Text className="text-gray-400 text-xs mb-2">
              Enter the 6-digit code from your app:
            </Text>
            <TextInput
              value={otpCode}
              onChangeText={(t) => setOtpCode(t.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              maxLength={6}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-xl mb-4"
              style={{ letterSpacing: 8 }}
            />

            <TouchableOpacity
              onPress={handleVerify2FA}
              disabled={verifying2FA}
              className={`py-3 rounded-xl mb-3 ${verifying2FA ? "bg-green-500/50" : "bg-green-500"}`}
            >
              {verifying2FA ? (
                <ActivityIndicator color="#030712" />
              ) : (
                <Text className="text-gray-950 text-center font-bold text-sm">
                  Verify & Enable
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setQrModalVisible(false);
                setQrCode(null);
                setSecret(null);
                setOtpCode("");
              }}
              className="py-3 rounded-xl bg-gray-800"
            >
              <Text className="text-white text-center text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        visible={disableModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDisableModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-white text-lg font-bold mb-2">
              Disable 2FA
            </Text>
            <Text className="text-gray-400 text-xs mb-4">
              Enter the 6-digit code from your authenticator app to disable
              two-factor authentication.
            </Text>

            <TextInput
              value={disableCode}
              onChangeText={(t) => setDisableCode(t.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              maxLength={6}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-xl mb-4"
              style={{ letterSpacing: 8 }}
            />

            <TouchableOpacity
              onPress={handleDisable2FA}
              disabled={disabling2FA}
              className={`py-3 rounded-xl mb-3 ${disabling2FA ? "bg-red-500/50" : "bg-red-500"}`}
            >
              {disabling2FA ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-sm">
                  Disable 2FA
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setDisableModalVisible(false);
                setDisableCode("");
              }}
              className="py-3 rounded-xl bg-gray-800"
            >
              <Text className="text-white text-center text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
