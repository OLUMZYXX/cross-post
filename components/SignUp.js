import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp({ onNavigateToSignIn, onNavigateToHome }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-20 w-56 h-56 rounded-full bg-green-500/10" />
        <View className="absolute top-60 -left-24 w-64 h-64 rounded-full bg-emerald-500/10" />
        <View className="absolute -bottom-32 right-10 w-72 h-72 rounded-full bg-teal-500/10" />
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
            <View className="mb-8">
              <Text className="text-green-400 text-xs tracking-widest font-semibold mb-2">
                CREATE ACCOUNT
              </Text>
              <Text className="text-4xl font-bold text-white mb-2">
                Join{"\n"}Cross-Post
              </Text>
              <View className="w-16 h-1 bg-green-500 rounded-full" />
            </View>

            <View className="flex-1 justify-center">
              <View className="bg-gray-900/80 rounded-3xl p-6 border border-gray-800">
                <View className="mb-5">
                  <Text className="text-gray-400 text-sm mb-2 font-medium">
                    Full Name
                  </Text>
                  <View className="bg-gray-800 rounded-xl border border-gray-700 px-4 py-4">
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor="#6b7280"
                      className="text-white text-base"
                    />
                  </View>
                </View>

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
                    />
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="text-gray-400 text-sm mb-2 font-medium">
                    Password
                  </Text>
                  <View className="bg-gray-800 rounded-xl border border-gray-700 px-4 py-4">
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create a password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry
                      className="text-white text-base"
                    />
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-gray-400 text-sm mb-2 font-medium">
                    Confirm Password
                  </Text>
                  <View className="bg-gray-800 rounded-xl border border-gray-700 px-4 py-4">
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry
                      className="text-white text-base"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => onNavigateToHome({ name })}
                  className="bg-green-500 py-4 rounded-xl border border-green-400 mb-4"
                >
                  <Text className="text-gray-950 text-center text-lg font-bold">
                    Create Account
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-px bg-gray-700" />
                  <Text className="text-gray-500 mx-4 text-sm">or</Text>
                  <View className="flex-1 h-px bg-gray-700" />
                </View>

                <TouchableOpacity
                  onPress={() => onNavigateToHome({ name: "John" })}
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

                <TouchableOpacity className="bg-gray-800 py-4 rounded-xl border border-gray-700 flex-row items-center justify-center">
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
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={onNavigateToSignIn}>
                <Text className="text-green-400 text-base font-semibold">
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
