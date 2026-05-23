import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthScreenShell from "./AuthScreenShell";
import ChunkyButton from "./ChunkyButton";
import { authAPI, saveToken } from "../services/api";
import { useToast } from "./Toast";
import { FONTS, useTheme } from "../constants/theme";

export default function TwoFactorVerify({ tempToken, onSuccess, onBack }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { colors, resolved } = useTheme();
  const { showToast } = useToast();

  const handleVerify = async () => {
    if (code.length !== 6) {
      showToast({
        type: "warning",
        title: "Invalid code",
        message: "Enter the 6-digit code from your authenticator app.",
      });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.login2FA(tempToken, code);
      await saveToken(data.token);
      showToast({
        type: "success",
        title: "Welcome back!",
        message: `Signed in as ${data.user.name}.`,
      });
      onSuccess(data.user);
    } catch (err) {
      showToast({
        type: "error",
        title: "Verification failed",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      eyebrow="EXTRA SECURITY"
      title="Two-factor code"
      subtitle="Open your authenticator app and enter the 6-digit code. We'll never see it."
      footer={
        <TouchableOpacity onPress={onBack} disabled={loading} activeOpacity={0.7}>
          <Text className="text-ink-muted font-sans text-[13px]">
            ← Back to sign in
          </Text>
        </TouchableOpacity>
      }
    >
      <Text className="text-ink-muted text-[10px] font-sans-bold tracking-[2px] mb-3">
        VERIFICATION CODE
      </Text>
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: colors.rule,
          marginBottom: 28,
        }}
      >
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ""))}
          placeholder="000000"
          placeholderTextColor={colors.inkSoft}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          editable={!loading}
          keyboardAppearance={resolved === "dark" ? "dark" : "light"}
          style={{
            color: colors.ink,
            fontFamily: FONTS.serifBold,
            fontSize: 30,
            letterSpacing: 14,
            textAlign: "center",
            paddingVertical: 18,
          }}
        />
      </View>

      <ChunkyButton
        label={loading ? "Verifying..." : "Verify"}
        onPress={handleVerify}
        variant="primary"
        disabled={loading}
        fullWidth
        icon={
          loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          )
        }
      />
    </AuthScreenShell>
  );
}
