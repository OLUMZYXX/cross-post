import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, Linking } from "react-native";
import * as Application from "expo-application";
import { getColors, useTheme } from "../constants/theme";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import ThemePicker from "./ThemePicker";
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from "../constants/legal";

const appVersion = Application.nativeApplicationVersion || "1.0.0";
const buildNumber = Application.nativeBuildVersion;
const versionLabel = buildNumber
  ? `Cross-Post v${appVersion} (${buildNumber})`
  : `Cross-Post v${appVersion}`;

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
  onResetOnboarding,
}) {
  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open link", "Please try again later.");
    }
  };

  const handleVersionLongPress = () => {
    if (!onResetOnboarding) return;
    Alert.alert(
      "Replay onboarding?",
      "This signs you out and shows the welcome flow again, the same way a brand-new user would see it.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => onResetOnboarding() },
      ],
    );
  };
  const { resolved } = useTheme();
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />
      <View className="flex-1 px-5 pt-14">
        <Text className="text-ink text-2xl font-serif-bold mb-5">Settings</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={getColors().terracotta}
              colors={[getColors().terracotta]}
              progressBackgroundColor={getColors().paperLight}
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
              iconColor={getColors().terracotta}
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

          <SectionLabel label="Appearance" />
          <ThemePicker />

          <SectionLabel label="General" />
          <View className="bg-paper-light rounded-2xl border border-rule overflow-hidden">
            <SettingsRow
              icon="shield-checkmark-outline"
              iconColor={getColors().terracottaShadow}
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

          <SectionLabel label="Legal" />
          <View className="bg-paper-light rounded-2xl border border-rule overflow-hidden">
            <SettingsRow
              icon="document-text-outline"
              iconColor={getColors().olive}
              iconBg="bg-paper-deep"
              label="Privacy Policy"
              description="How we collect, use and protect your data"
              onPress={() => openLink(PRIVACY_POLICY_URL)}
            />
            <SettingsRow
              icon="reader-outline"
              iconColor="#a78bfa"
              iconBg="bg-paper-deep"
              label="Terms of Service"
              description="The rules for using Cross-Post"
              onPress={() => openLink(TERMS_OF_SERVICE_URL)}
              isLast
            />
          </View>

          <SectionLabel label="" />
          <TouchableOpacity
            onPress={onLogout}
            className="bg-paper-light rounded-2xl py-3.5 border border-rule flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={17} color={getColors().terracotta} />
            <Text className="text-terracotta font-sans-medium text-sm ml-2">Log Out</Text>
          </TouchableOpacity>

          <View className="items-center mt-6">
            <TouchableOpacity
              onLongPress={handleVersionLongPress}
              delayLongPress={800}
              activeOpacity={0.6}
            >
              <Text className="text-ink-soft text-[10px]">{versionLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
