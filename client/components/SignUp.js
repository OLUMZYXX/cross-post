import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import { authAPI, saveToken } from "../services/api";
import { useToast } from "./Toast";
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "../config/googleConfig";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp({ onNavigateToSignIn, onNavigateToHome }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast } = useToast();

  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (!googleResponse) return;

    if (googleResponse.type === "success") {
      const accessToken = googleResponse.authentication?.accessToken;
      if (accessToken) {
        handleGoogleToken(accessToken);
        return;
      }

      showToast({
        type: "error",
        title: "Google sign-up failed",
        message: "No access token returned from Google.",
      });
      return;
    }

    if (googleResponse.type === "error") {
      const message =
        googleResponse.error?.message ||
        googleResponse.params?.error_description ||
        googleResponse.params?.error ||
        "Google authorization failed.";
      showToast({
        type: "error",
        title: "Google sign-up blocked",
        message,
      });
    }
  }, [googleResponse, showToast]);

  const handleGoogleSignUp = async () => {
    try {
      await promptGoogleAsync({ showInRecents: true });
    } catch (err) {
      showToast({
        type: "error",
        title: "Google sign-up failed",
        message: err?.message || "Could not open Google sign-in.",
      });
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
      const { data } = await authAPI.appleAuth(
        credential.identityToken,
        credential.fullName,
        credential.email,
      );
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
    <View className="flex-1 bg-paper">
      <StatusBar style="dark" />
      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-20 w-56 h-56 rounded-full bg-terracotta-soft/30" />
        <View className="absolute top-60 -left-24 w-64 h-64 rounded-full bg-olive/10" />
        <View className="absolute -bottom-32 right-10 w-72 h-72 rounded-full bg-teal-500/10" />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 pt-16 pb-10">
            <View className="mb-8">
              <View className="w-16 h-16 rounded-2xl bg-terracotta items-center justify-center mb-5">
                <Ionicons name="share-social" size={30} color="#E3DAC4" />
              </View>
              <Text className="text-terracotta text-xs tracking-widest font-sans-semibold mb-2">CREATE ACCOUNT</Text>
              <Text className="text-4xl font-sans-bold text-ink mb-2">Join{"\n"}Cross-Post</Text>
              <View className="w-16 h-1 bg-terracotta rounded-full" />
            </View>
            <View className="flex-1 justify-center">
              <View className="bg-paper-light rounded-3xl p-6 border border-rule">
                <View className="mb-5">
                  <Text className="text-ink-muted text-sm mb-2 font-sans-medium">Full Name</Text>
                  <View className="bg-paper-deep rounded-xl border border-rule px-4 py-4">
                    <TextInput value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor="#564B3F" className="text-ink text-base" editable={!loading} />
                  </View>
                </View>
                <View className="mb-5">
                  <Text className="text-ink-muted text-sm mb-2 font-sans-medium">Email Address</Text>
                  <View className="bg-paper-deep rounded-xl border border-rule px-4 py-4">
                    <TextInput value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor="#564B3F" keyboardType="email-address" autoCapitalize="none" className="text-ink text-base" editable={!loading} />
                  </View>
                </View>
                <View className="mb-5">
                  <Text className="text-ink-muted text-sm mb-2 font-sans-medium">Password</Text>
                  <View className="bg-paper-deep rounded-xl border border-rule px-4 py-4 flex-row items-center">
                    <TextInput value={password} onChangeText={setPassword} placeholder="Create a password" placeholderTextColor="#564B3F" secureTextEntry={!showPassword} className="text-ink text-base flex-1" editable={!loading} />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#564B3F" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="mb-6">
                  <Text className="text-ink-muted text-sm mb-2 font-sans-medium">Confirm Password</Text>
                  <View className="bg-paper-deep rounded-xl border border-rule px-4 py-4 flex-row items-center">
                    <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm your password" placeholderTextColor="#564B3F" secureTextEntry={!showConfirmPassword} className="text-ink text-base flex-1" editable={!loading} />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-2">
                      <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#564B3F" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={handleSignUp} disabled={loading} className={`py-4 rounded-xl border border-terracotta-shadow mb-4 ${loading ? "bg-terracotta/50" : "bg-terracotta"}`}>
                  {loading ? <ActivityIndicator color="#E3DAC4" /> : <Text className="text-paper-light text-center text-lg font-serif-bold">Create Account</Text>}
                </TouchableOpacity>
                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-px bg-paper-deep" />
                  <Text className="text-ink-muted mx-4 text-sm">or</Text>
                  <View className="flex-1 h-px bg-paper-deep" />
                </View>
                <TouchableOpacity onPress={handleGoogleSignUp} disabled={loading} className="bg-paper-deep py-4 rounded-xl border border-rule flex-row items-center justify-center mb-3">
                  <Ionicons name="logo-google" size={20} color="#1B1711" style={{ marginRight: 12 }} />
                  <Text className="text-ink text-base font-sans-medium">Continue with Google</Text>
                </TouchableOpacity>
                {Platform.OS === "ios" && (
                  <TouchableOpacity onPress={handleAppleSignUp} disabled={loading} className="bg-paper-deep py-4 rounded-xl border border-rule flex-row items-center justify-center">
                    <Ionicons name="logo-apple" size={20} color="#1B1711" style={{ marginRight: 12 }} />
                    <Text className="text-ink text-base font-sans-medium">Continue with Apple</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View className="flex-row justify-center mt-6">
              <Text className="text-ink-muted text-base">Already have an account? </Text>
              <TouchableOpacity onPress={onNavigateToSignIn} disabled={loading}>
                <Text className="text-terracotta text-base font-sans-semibold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
