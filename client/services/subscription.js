import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
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
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
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
  const active = info?.entitlements?.active;
  if (!active) return false;
  if (active[PRO_ENTITLEMENT_ID]) return true;
  return Object.keys(active).length > 0;
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
  if (!isSubscriptionSupported()) {
    return { packages: [], error: "No RevenueCat key in this build (or not iOS)." };
  }
  try {
    const offerings = await Purchases.getOfferings();
    if (!offerings.current) {
      return { packages: [], error: "No 'current' offering set in RevenueCat." };
    }
    const packages = offerings.current.availablePackages || [];
    if (packages.length === 0) {
      return {
        packages: [],
        error:
          "Offering has 0 products. App Store returned none — check: Paid Apps agreement Active, products 'Ready to Submit', product IDs match, offering uses the App Store products.",
      };
    }
    return { packages, error: null };
  } catch (e) {
    return { packages: [], error: e?.message || String(e) };
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
