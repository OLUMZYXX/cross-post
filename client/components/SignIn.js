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
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { authAPI, saveToken } from "../services/api";
import { useToast } from "./Toast";

export default function SignIn({ onNavigateToSignUp, onNavigateToHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();

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

                <TouchableOpacity
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
