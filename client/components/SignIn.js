import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import { authAPI, saveToken } from "../services/api";
import { useToast } from "./Toast";
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from "../config/googleConfig";
import AuthScreenShell from "./AuthScreenShell";
import AuthField from "./AuthField";
import AuthSocialButtons from "./AuthSocialButtons";
import ChunkyButton from "./ChunkyButton";
import TwoFactorVerify from "./TwoFactorVerify";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn({ onNavigateToSignUp, onNavigateToHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const { showToast } = useToast();

  const googleAuthConfig = {};
  if (GOOGLE_ANDROID_CLIENT_ID) googleAuthConfig.androidClientId = GOOGLE_ANDROID_CLIENT_ID;
  if (GOOGLE_IOS_CLIENT_ID) googleAuthConfig.iosClientId = GOOGLE_IOS_CLIENT_ID;
  if (GOOGLE_WEB_CLIENT_ID) googleAuthConfig.webClientId = GOOGLE_WEB_CLIENT_ID;
  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest(googleAuthConfig);

  useEffect(() => {
    if (!googleResponse) return;
    if (googleResponse.type === "success") {
      const accessToken = googleResponse.authentication?.accessToken;
      if (accessToken) {
        handleGoogleToken(accessToken);
        return;
      }
      showToast({ type: "error", title: "Google sign-in failed", message: "No access token returned." });
      return;
    }
    if (googleResponse.type === "error") {
      const msg = googleResponse.error?.message || googleResponse.params?.error_description || googleResponse.params?.error || "Google authorization failed.";
      showToast({ type: "error", title: "Google sign-in blocked", message: msg });
    }
  }, [googleResponse, showToast]);

  const handleGoogleSignIn = async () => {
    if (Platform.OS === "ios" && !GOOGLE_IOS_CLIENT_ID) {
      showToast({
        type: "error",
        title: "Google sign-in not configured",
        message: "Missing iOS client ID. Add one in Google Cloud Console and update googleConfig.js.",
        duration: 6000,
      });
      return;
    }
    if (Platform.OS === "android" && !GOOGLE_ANDROID_CLIENT_ID) {
      showToast({
        type: "error",
        title: "Google sign-in not configured",
        message: "Missing Android client ID. Update googleConfig.js.",
        duration: 6000,
      });
      return;
    }
    try {
      await promptGoogleAsync({ showInRecents: true });
    } catch (err) {
      showToast({ type: "error", title: "Google sign-in failed", message: err?.message || "Could not open Google sign-in." });
    }
  };

  const handleGoogleToken = async (accessToken) => {
    setLoading(true);
    try {
      const { data } = await authAPI.googleAuth(accessToken);
      await saveToken(data.token);
      showToast({ type: "success", title: "Welcome!", message: `Signed in as ${data.user.name}.` });
      onNavigateToHome(data.user);
    } catch (err) {
      showToast({ type: "error", title: "Google sign-in failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { data } = await authAPI.appleAuth(credential.identityToken, credential.fullName, credential.email);
      await saveToken(data.token);
      showToast({ type: "success", title: "Welcome!", message: `Signed in as ${data.user.name}.` });
      onNavigateToHome(data.user);
    } catch (err) {
      if (err.code !== "ERR_REQUEST_CANCELED") {
        showToast({ type: "error", title: "Apple sign-in failed", message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      showToast({ type: "warning", title: "Missing fields", message: "Please enter your email and password." });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.signin(email.trim(), password);
      if (data.requiresTwoFactor) {
        setTempToken(data.tempToken);
        setShow2FA(true);
        setLoading(false);
        return;
      }
      await saveToken(data.token);
      showToast({ type: "success", title: "Welcome back!", message: `Signed in as ${data.user.name}.` });
      onNavigateToHome(data.user);
    } catch (err) {
      showToast({ type: "error", title: "Sign in failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (show2FA) {
    return (
      <TwoFactorVerify
        tempToken={tempToken}
        onSuccess={onNavigateToHome}
        onBack={() => {
          setShow2FA(false);
          setTempToken(null);
        }}
      />
    );
  }

  return (
    <AuthScreenShell
      eyebrow="WELCOME BACK"
      title={"Sign in to\ncontinue."}
      subtitle="Pick up where you left off and send your next thought everywhere it should live."
      footer={
        <View className="flex-row items-center">
          <Text className="text-ink-muted font-sans text-[14px]">New here? </Text>
          <TouchableOpacity onPress={onNavigateToSignUp} disabled={loading} activeOpacity={0.7}>
            <Text className="text-terracotta font-sans-bold text-[14px]">Create an account</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secure
        editable={!loading}
      />

      <TouchableOpacity className="mb-6 self-end" disabled={loading} activeOpacity={0.7}>
        <Text className="text-ink-muted text-[12px] font-sans-medium">
          Forgot password?
        </Text>
      </TouchableOpacity>

      <ChunkyButton
        label={loading ? "Signing in..." : "Sign In"}
        onPress={handleSignIn}
        variant="primary"
        disabled={loading}
        fullWidth
        icon={
          loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          )
        }
      />

      <AuthSocialButtons
        onGoogle={handleGoogleSignIn}
        onApple={handleAppleSignIn}
        disabled={loading}
      />
    </AuthScreenShell>
  );
}
