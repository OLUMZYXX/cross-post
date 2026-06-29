import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import {
  REVENUECAT_IOS_API_KEY,
  PRO_ENTITLEMENT_ID,
} from "../config/revenuecatConfig";

let configured = false;

export function isSubscriptionSupported() {
  return Platform.OS === "ios" && !!REVENUECAT_IOS_API_KEY;
}

export async function configureSubscriptions(appUserId) {
  if (!isSubscriptionSupported()) return;
  try {
    if (!configured) {
      Purchases.configure({
        apiKey: REVENUECAT_IOS_API_KEY,
        appUserID: appUserId || null,
      });
      configured = true;
    } else if (appUserId) {
      await Purchases.logIn(appUserId);
    }
  } catch {}
}

export async function logOutSubscriptions() {
  if (!isSubscriptionSupported() || !configured) return;
  try {
    await Purchases.logOut();
  } catch {}
}

export function isProFromInfo(info) {
  return !!info?.entitlements?.active?.[PRO_ENTITLEMENT_ID];
}

export async function getProStatus() {
  if (!isSubscriptionSupported()) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return isProFromInfo(info);
  } catch {
    return false;
  }
}

export async function getProPackages() {
  if (!isSubscriptionSupported()) return [];
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  } catch {
    return [];
  }
}

export async function purchaseProPackage(pkg) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return isProFromInfo(customerInfo);
}

export async function restoreSubscriptions() {
  const info = await Purchases.restorePurchases();
  return isProFromInfo(info);
}

export function addProStatusListener(callback) {
  if (!isSubscriptionSupported()) return () => {};
  const handler = (info) => callback(isProFromInfo(info));
  Purchases.addCustomerInfoUpdateListener(handler);
  return () => {
    try {
      Purchases.removeCustomerInfoUpdateListener(handler);
    } catch {}
  };
}
