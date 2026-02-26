import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

function SettingsRow({ icon, iconColor, iconBg, label, description, value, onPress, isLast }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-3.5 ${!isLast ? "border-b border-gray-800/40" : ""}`}
      activeOpacity={0.6}
    >
      <View className={`w-9 h-9 rounded-xl ${iconBg} items-center justify-center mr-3`}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-white text-sm font-medium">{label}</Text>
        {description && (
          <Text className="text-gray-600 text-[11px] mt-0.5">{description}</Text>
        )}
      </View>
      {value && (
        <View className="bg-gray-800 rounded-full px-2 py-0.5 mr-2">
          <Text className="text-gray-400 text-[10px] font-medium">{value}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color="#374151" />
    </TouchableOpacity>
  );
}

function SectionLabel({ label }) {
  return (
    <Text className="text-gray-600 text-[10px] tracking-wider uppercase ml-1 mb-2 mt-5">
      {label}
    </Text>
  );
}

export default function SettingsScreen({
  user,
  connectedPlatformsCount,
  refreshing,
  onRefresh,
  onEditProfile,
  onConnectedAccounts,
  onNotifications,
  onPrivacy,
  onHelp,
  onLogout,
}) {
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />
      <View className="flex-1 px-5 pt-14">
        <Text className="text-white text-2xl font-bold mb-5">Settings</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4ade80"
              colors={["#4ade80"]}
              progressBackgroundColor="#111827"
            />
          }
        >
          <TouchableOpacity
            onPress={onEditProfile}
            className="bg-gray-900 rounded-2xl p-4 border border-gray-800/60 mb-2"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-2xl bg-green-500/15 items-center justify-center mr-4">
                <Text className="text-green-400 text-lg font-bold">{initials}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-bold">
                  {user?.name || "User"}
                </Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  {user?.email || "Tap to edit profile"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#374151" />
            </View>
          </TouchableOpacity>

          <SectionLabel label="Account" />
          <View className="bg-gray-900 rounded-2xl border border-gray-800/60 overflow-hidden">
            <SettingsRow
              icon="link-outline"
              iconColor="#4ade80"
              iconBg="bg-green-500/15"
              label="Connected Accounts"
              description="Manage your linked social platforms"
              value={String(connectedPlatformsCount)}
              onPress={onConnectedAccounts}
            />
            <SettingsRow
              icon="notifications-outline"
              iconColor="#a78bfa"
              iconBg="bg-purple-500/15"
              label="Notifications"
              description="Push alerts and email preferences"
              onPress={onNotifications}
              isLast
            />
          </View>

          <SectionLabel label="General" />
          <View className="bg-gray-900 rounded-2xl border border-gray-800/60 overflow-hidden">
            <SettingsRow
              icon="shield-checkmark-outline"
              iconColor="#facc15"
              iconBg="bg-yellow-500/15"
              label="Privacy & Security"
              description="Data, password and account safety"
              onPress={onPrivacy}
            />
            <SettingsRow
              icon="chatbubble-ellipses-outline"
              iconColor="#60a5fa"
              iconBg="bg-blue-500/15"
              label="Help & Support"
              description="FAQs, contact us, report a bug"
              onPress={onHelp}
              isLast
            />
          </View>

          <SectionLabel label="" />
          <TouchableOpacity
            onPress={onLogout}
            className="bg-gray-900 rounded-2xl py-3.5 border border-gray-800/60 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={17} color="#ef4444" />
            <Text className="text-red-400 font-medium text-sm ml-2">Log Out</Text>
          </TouchableOpacity>

          <View className="items-center mt-6">
            <Text className="text-gray-700 text-[10px]">Cross-Post v1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
