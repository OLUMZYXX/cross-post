import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { useToast } from "./Toast";
import useSubscription from "../hooks/useSubscription";

const PLAN_ORDER = { ANNUAL: 0, SIX_MONTH: 1, MONTHLY: 2 };

const PLAN_META = {
  ANNUAL: { label: "Yearly", badge: "Best value · 7-day free trial" },
  SIX_MONTH: { label: "6 Months", badge: "Save 20%" },
  MONTHLY: { label: "Monthly", badge: null },
};

const FEATURES = [
  "Post to Twitter / X",
  "Unlimited connected platforms",
  "Unlimited posts & AI rephrase",
  "Bulk scheduling & copyright checker",
  "Advanced analytics & priority support",
];

const TERMS_URL = "https://cross-post-web.vercel.app/terms";
const PRIVACY_URL = "https://cross-post-web.vercel.app/privacy";

export default function Paywall({ visible, onClose, onSuccess, user }) {
  const { packages, loading, purchase, restore, isPro } = useSubscription(user);
  const { showToast } = useToast();
  const [selected, setSelected] = useState(null);

  const sorted = [...packages].sort(
    (a, b) => (PLAN_ORDER[a.packageType] ?? 9) - (PLAN_ORDER[b.packageType] ?? 9),
  );

  useEffect(() => {
    if (!selected && sorted.length) setSelected(sorted[0].identifier);
  }, [sorted, selected]);

  const handleSubscribe = async () => {
    const pkg = sorted.find((p) => p.identifier === selected);
    if (!pkg) return;
    const res = await purchase(pkg);
    if (res.success) {
      showToast({ type: "success", title: "Welcome to Pro!", message: "All features are now unlocked." });
      onSuccess?.();
      onClose();
    } else if (res.error) {
      showToast({ type: "error", title: "Purchase failed", message: res.error });
    }
  };

  const handleRestore = async () => {
    const res = await restore();
    if (res.success) {
      showToast({ type: "success", title: "Pro restored", message: "Your subscription is active." });
      onSuccess?.();
      onClose();
    } else {
      showToast({ type: "info", title: "Nothing to restore", message: "No active subscription found." });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-ink/60">
        <View className="bg-paper rounded-t-3xl px-6 pt-5 pb-8 max-h-[90%]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-ink text-xl font-serif-bold">Cross-Post Pro</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={getColors().inkMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-ink-muted text-sm mb-5 leading-5">
              Unlock Twitter/X posting and every Pro feature.
            </Text>

            <View className="mb-6">
              {FEATURES.map((f) => (
                <View key={f} className="flex-row items-center mb-2.5">
                  <Ionicons name="checkmark-circle" size={18} color={getColors().olive} />
                  <Text className="text-ink text-sm ml-2.5">{f}</Text>
                </View>
              ))}
            </View>

            {sorted.length === 0 ? (
              <Text className="text-ink-muted text-xs text-center my-6">
                Subscription plans are loading or unavailable on this device.
              </Text>
            ) : (
              sorted.map((pkg) => {
                const meta = PLAN_META[pkg.packageType] || { label: pkg.product.title };
                const active = selected === pkg.identifier;
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    onPress={() => setSelected(pkg.identifier)}
                    className={`rounded-2xl border p-4 mb-3 ${active ? "border-olive bg-olive/5" : "border-rule bg-paper-light"}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-ink font-sans-bold text-base">{meta.label}</Text>
                      <Text className="text-ink font-sans-bold text-base">{pkg.product.priceString}</Text>
                    </View>
                    {meta.badge && (
                      <Text className="text-olive text-[11px] font-sans-semibold mt-1">{meta.badge}</Text>
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            <TouchableOpacity
              onPress={handleSubscribe}
              disabled={loading || !selected || isPro}
              className={`py-3.5 rounded-xl mt-3 ${loading || !selected || isPro ? "bg-olive/40" : "bg-olive"}`}
            >
              {loading ? (
                <ActivityIndicator color={getColors().paperLight} />
              ) : (
                <Text className="text-paper-light text-center font-sans-bold text-sm">
                  {isPro ? "You're on Pro" : "Subscribe"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRestore} disabled={loading} className="py-3 mt-1">
              <Text className="text-ink-muted text-center text-xs">Restore Purchases</Text>
            </TouchableOpacity>

            <Text className="text-ink-soft text-[10px] text-center leading-4 mt-3">
              Subscriptions auto-renew until cancelled. Manage or cancel anytime in your App Store settings.
            </Text>
            <View className="flex-row justify-center gap-5 mt-3">
              <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
                <Text className="text-ink-muted text-[11px] underline">Terms</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
                <Text className="text-ink-muted text-[11px] underline">Privacy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
