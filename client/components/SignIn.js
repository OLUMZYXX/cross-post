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
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import { authAPI, saveToken } from "../services/api";
import { useToast } from "./Toast";
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from "../config/googleConfig";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn({ onNavigateToSignUp, onNavigateToHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const { showToast } = useToast();

  const [request, googleResponse, promptGoogleAsync] =
    AuthSession.useAuthRequest(
      {
        clientId:
          Platform.OS === "android"
            ? GOOGLE_ANDROID_CLIENT_ID
            : Platform.OS === "ios"
              ? GOOGLE_IOS_CLIENT_ID
              : GOOGLE_WEB_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Token,
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      },
      {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
      },
    );

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const accessToken = googleResponse.authentication?.accessToken;
      if (accessToken) handleGoogleToken(accessToken);
    }
  }, [googleResponse]);

  const handleGoogleToken = async (accessToken) => {
    setLoading(true);
    try {
      const { data } = await authAPI.googleAuth(accessToken);
      await saveToken(data.token);
      showToast({
        type: "success",
        title: "Welcome!",
        message: `Signed in as ${data.user.name}.`,
      });
      onNavigateToHome(data.user);
    } catch (err) {
      showToast({
        type: "error",
        title: "Google sign-in failed",
        message: err.message,
      });
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
      const { data } = await authAPI.appleAuth(
        credential.identityToken,
        credential.fullName,
        credential.email,
      );
      await saveToken(data.token);
      showToast({
        type: "success",
        title: "Welcome!",
        message: `Signed in as ${data.user.name}.`,
      });
      onNavigateToHome(data.user);
    } catch (err) {
      if (err.code !== "ERR_REQUEST_CANCELED") {
        showToast({
          type: "error",
          title: "Apple sign-in failed",
          message: err.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      showToast({
        type: "warning",
        title: "Missing fields",
        message: "Please enter your email and password.",
      });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.signin(email.trim(), password);

      // If 2FA is enabled, show OTP input instead of navigating
      if (data.requiresTwoFactor) {
        setTempToken(data.tempToken);
        setOtpCode("");
        setShow2FA(true);
        setLoading(false);
        return;
      }

      await saveToken(data.token);
      showToast({
        type: "success",
        title: "Welcome back!",
        message: `Signed in as ${data.user.name}.`,
      });
      onNavigateToHome(data.user);
    } catch (err) {
      showToast({
        type: "error",
        title: "Sign in failed",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FALogin = async () => {
    if (otpCode.length !== 6) {
      showToast({
        type: "warning",
        title: "Invalid code",
        message: "Enter the 6-digit code from your authenticator app.",
      });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.login2FA(tempToken, otpCode);
      await saveToken(data.token);
      showToast({
        type: "success",
        title: "Welcome back!",
        message: `Signed in as ${data.user.name}.`,
      });
      setShow2FA(false);
      setTempToken(null);
      setOtpCode("");
      onNavigateToHome(data.user);
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

  if (show2FA) {
    return (
      <View className="flex-1 bg-gray-950">
        <StatusBar style="light" />
        <View className="absolute top-0 left-0 right-0 bottom-0">
          <View className="absolute top-20 -left-16 w-48 h-48 rounded-full bg-green-500/10" />
          <View className="absolute top-80 -right-20 w-72 h-72 rounded-full bg-emerald-500/10" />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-6 pt-16 justify-center">
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-4">
                <Ionicons name="shield-checkmark" size={32} color="#4ade80" />
              </View>
              <Text className="text-white text-2xl font-bold mb-2">
                Two-Factor Authentication
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                Enter the 6-digit code from your authenticator app
              </Text>
            </View>

            <View className="bg-gray-900/80 rounded-3xl p-6 border border-gray-800">
              <TextInput
                value={otpCode}
                onChangeText={(t) => setOtpCode(t.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                placeholderTextColor="#6b7280"
                keyboardType="number-pad"
                maxLength={6}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white text-center text-2xl mb-4"
                style={{ letterSpacing: 10 }}
                autoFocus
                editable={!loading}
              />

              <TouchableOpacity
                onPress={handleVerify2FALogin}
                disabled={loading}
                className={`py-4 rounded-xl border border-green-400 mb-3 ${loading ? "bg-green-500/50" : "bg-green-500"}`}
              >
                {loading ? (
                  <ActivityIndicator color="#030712" />
                ) : (
                  <Text className="text-gray-950 text-center text-lg font-bold">
                    Verify
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShow2FA(false);
                  setTempToken(null);
                  setOtpCode("");
                }}
                disabled={loading}
                className="py-3"
              >
                <Text className="text-gray-400 text-center text-sm">
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />
      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-20 -left-16 w-48 h-48 rounded-full bg-green-500/10" />
        <View className="absolute top-80 -right-20 w-72 h-72 rounded-full bg-emerald-500/10" />
        <View className="absolute -bottom-24 left-20 w-64 h-64 rounded-full bg-teal-500/10" />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-16 pb-10">
            <View className="mb-10">
              <View className="w-16 h-16 rounded-2xl bg-green-500 items-center justify-center mb-5">
                <Ionicons name="share-social" size={30} color="#030712" />
              </View>
              <Text className="text-green-400 text-xs tracking-widest font-semibold mb-2">
                WELCOME BACK
              </Text>
              <Text className="text-4xl font-bold text-white mb-2">
                Sign In to{"\n"}Cross-Post
              </Text>
              <View className="w-16 h-1 bg-green-500 rounded-full" />
            </View>
            <View className="flex-1 justify-center">
              <View className="bg-gray-900/80 rounded-3xl p-6 border border-gray-800">
                <View className="mb-5">
                  <Text className="text-gray-400 text-sm mb-2 font-medium">
                    Email Address
                  </Text>
                  <View className="bg-gray-800 rounded-xl border border-gray-700 px-4 py-4">
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#6b7280"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="text-white text-base"
                      editable={!loading}
                    />
                  </View>
                </View>
                <View className="mb-2">
                  <Text className="text-gray-400 text-sm mb-2 font-medium">
                    Password
                  </Text>
                  <View className="bg-gray-800 rounded-xl border border-gray-700 px-4 py-4 flex-row items-center">
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showPassword}
                      className="text-white text-base flex-1"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="ml-2"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity className="mb-6" disabled={loading}>
                  <Text className="text-green-400 text-sm text-right font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSignIn}
                  disabled={loading}
                  className={`py-4 rounded-xl border border-green-400 mb-4 ${loading ? "bg-green-500/50" : "bg-green-500"}`}
                >
                  {loading ? (
                    <ActivityIndicator color="#030712" />
                  ) : (
                    <Text className="text-gray-950 text-center text-lg font-bold">
                      Login
                    </Text>
                  )}
                </TouchableOpacity>
                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-px bg-gray-700" />
                  <Text className="text-gray-500 mx-4 text-sm">or</Text>
                  <View className="flex-1 h-px bg-gray-700" />
                </View>
                <TouchableOpacity
                  onPress={() => promptGoogleAsync()}
                  disabled={loading}
                  className="bg-gray-800 py-4 rounded-xl border border-gray-700 flex-row items-center justify-center mb-3"
                >
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 12 }}
                  />
                  <Text className="text-white text-base font-medium">
                    Continue with Google
                  </Text>
                </TouchableOpacity>
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    onPress={handleAppleSignIn}
                    disabled={loading}
                    className="bg-gray-800 py-4 rounded-xl border border-gray-700 flex-row items-center justify-center"
                  >
                    <Ionicons
                      name="logo-apple"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 12 }}
                    />
                    <Text className="text-white text-base font-medium">
                      Continue with Apple
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400 text-base">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={onNavigateToSignUp} disabled={loading}>
                <Text className="text-green-400 text-base font-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
