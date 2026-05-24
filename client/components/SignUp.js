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

WebBrowser.maybeCompleteAuthSession();

export default function SignUp({ onNavigateToSignIn, onNavigateToHome }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      if (accessToken) return handleGoogleToken(accessToken);
      showToast({ type: "error", title: "Google sign-up failed", message: "No access token returned." });
      return;
    }
    if (googleResponse.type === "error") {
      const msg = googleResponse.error?.message || googleResponse.params?.error_description || googleResponse.params?.error || "Google authorization failed.";
      showToast({ type: "error", title: "Google sign-up blocked", message: msg });
    }
  }, [googleResponse, showToast]);

  const handleGoogleSignUp = async () => {
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
      showToast({ type: "error", title: "Google sign-up failed", message: err?.message || "Could not open Google sign-in." });
    }
  };

  const handleGoogleToken = async (accessToken) => {
    setLoading(true);
    try {
      const { data } = await authAPI.googleAuth(accessToken);
      await saveToken(data.token);
      showToast({ type: "success", title: "Welcome!", message: `Account ready for ${data.user.name}.` });
      onNavigateToHome(data.user);
    } catch (err) {
      showToast({ type: "error", title: "Google sign-up failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
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
      showToast({ type: "success", title: "Welcome!", message: `Account ready for ${data.user.name}.` });
      onNavigateToHome(data.user);
    } catch (err) {
      if (err.code !== "ERR_REQUEST_CANCELED") {
        showToast({ type: "error", title: "Apple sign-up failed", message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showToast({ type: "warning", title: "Missing fields", message: "Please fill in all fields." });
      return;
    }
    if (password !== confirmPassword) {
      showToast({ type: "error", title: "Passwords don't match", message: "Please make sure your passwords match." });
      return;
    }
    if (password.length < 6) {
      showToast({ type: "warning", title: "Weak password", message: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.signup(name.trim(), email.trim(), password);
      await saveToken(data.token);
      showToast({ type: "success", title: "Welcome!", message: "Account created successfully." });
      onNavigateToHome(data.user);
    } catch (err) {
      showToast({ type: "error", title: "Sign up failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      eyebrow="JOIN THE TIMELINE"
      title={"Make an\naccount."}
      subtitle="One inbox for every timeline. Compose once, send everywhere it should live."
      footer={
        <View className="flex-row items-center">
          <Text className="text-ink-muted font-sans text-[14px]">Already a member? </Text>
          <TouchableOpacity onPress={onNavigateToSignIn} disabled={loading} activeOpacity={0.7}>
            <Text className="text-terracotta font-sans-bold text-[14px]">Sign in</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <AuthField
        label="Full Name"
        value={name}
        onChangeText={setName}
        placeholder="Your full name"
        editable={!loading}
      />
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
        placeholder="At least 6 characters"
        secure
        editable={!loading}
      />
      <AuthField
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Re-enter password"
        secure
        editable={!loading}
      />

      <View className="mt-2">
        <ChunkyButton
          label={loading ? "Creating..." : "Create Account"}
          onPress={handleSignUp}
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
      </View>

      <AuthSocialButtons
        onGoogle={handleGoogleSignUp}
        onApple={handleAppleSignUp}
        disabled={loading}
      />
    </AuthScreenShell>
  );
}
