import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

function SettingsRow({ icon, iconColor, iconBg, label, description, value, onPress, isLast }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-3.5 ${!isLast ? "border-b border-rule" : ""}`}
      activeOpacity={0.6}
    >
      <View className={`w-9 h-9 rounded-xl ${iconBg} items-center justify-center mr-3`}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-ink text-sm font-sans-medium">{label}</Text>
        {description && (
          <Text className="text-ink-soft text-[11px] mt-0.5">{description}</Text>
        )}
      </View>
      {value && (
        <View className="bg-paper-deep rounded-full px-2 py-0.5 mr-2">
          <Text className="text-ink-muted text-[10px] font-sans-medium">{value}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color="#374151" />
    </TouchableOpacity>
  );
}

function SectionLabel({ label }) {
  return (
    <Text className="text-ink-soft text-[10px] tracking-[2px] uppercase font-sans-semibold ml-1 mb-2 mt-5">
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
    <View className="flex-1 bg-paper">
      <StatusBar style="dark" />
      <View className="flex-1 px-5 pt-14">
        <Text className="text-ink text-2xl font-serif-bold mb-5">Settings</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={"#B14026"}
              colors={["#B14026"]}
              progressBackgroundColor="#E3DAC4"
            />
          }
        >
          <TouchableOpacity
            onPress={onEditProfile}
            className="bg-paper-light rounded-2xl p-4 border border-rule mb-2"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-2xl bg-terracotta-soft/30 items-center justify-center mr-4">
                <Text className="text-terracotta text-lg font-serif-bold">{initials}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-ink text-base font-sans-bold">
                  {user?.name || "User"}
                </Text>
                <Text className="text-ink-muted text-xs mt-0.5">
                  {user?.email || "Tap to edit profile"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#374151" />
            </View>
          </TouchableOpacity>

          <SectionLabel label="Account" />
          <View className="bg-paper-light rounded-2xl border border-rule overflow-hidden">
            <SettingsRow
              icon="link-outline"
              iconColor="#B14026"
              iconBg="bg-terracotta-soft/30"
              label="Connected Accounts"
              description="Manage your linked social platforms"
              value={String(connectedPlatformsCount)}
              onPress={onConnectedAccounts}
            />
            <SettingsRow
              icon="notifications-outline"
              iconColor="#a78bfa"
              iconBg="bg-paper-deep"
              label="Notifications"
              description="Push alerts and email preferences"
              onPress={onNotifications}
              isLast
            />
          </View>

          <SectionLabel label="General" />
          <View className="bg-paper-light rounded-2xl border border-rule overflow-hidden">
            <SettingsRow
              icon="shield-checkmark-outline"
              iconColor="#8E311B"
              iconBg="bg-paper-deep"
              label="Privacy & Security"
              description="Data, password and account safety"
              onPress={onPrivacy}
            />
            <SettingsRow
              icon="chatbubble-ellipses-outline"
              iconColor="#60a5fa"
              iconBg="bg-paper-deep"
              label="Help & Support"
              description="FAQs, contact us, report a bug"
              onPress={onHelp}
              isLast
            />
          </View>

          <SectionLabel label="" />
          <TouchableOpacity
            onPress={onLogout}
            className="bg-paper-light rounded-2xl py-3.5 border border-rule flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={17} color="#B14026" />
            <Text className="text-terracotta font-sans-medium text-sm ml-2">Log Out</Text>
          </TouchableOpacity>

          <View className="items-center mt-6">
            <Text className="text-ink-soft text-[10px]">Cross-Post v1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
