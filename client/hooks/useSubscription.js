import { useState, useEffect, useCallback } from "react";
import {
  isSubscriptionSupported,
  getProStatus,
  getProPackages,
  purchaseProPackage,
  restoreSubscriptions,
  addProStatusListener,
} from "../services/subscription";

export default function useSubscription(user) {
  const allowlistPro = !!user?.isPro;
  const [purchasedPro, setPurchasedPro] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSubscriptionSupported()) return;
    const [status, pkgs] = await Promise.all([
      getProStatus(),
      getProPackages(),
    ]);
    setPurchasedPro(status);
    setPackages(pkgs);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = addProStatusListener(setPurchasedPro);
    return unsubscribe;
  }, [refresh]);

  const purchase = useCallback(async (pkg) => {
    setLoading(true);
    try {
      const ok = await purchaseProPackage(pkg);
      setPurchasedPro(ok);
      return { success: ok };
    } catch (err) {
      if (err?.userCancelled) return { cancelled: true };
      return { error: err?.message || "Purchase failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setLoading(true);
    try {
      const ok = await restoreSubscriptions();
      setPurchasedPro(ok);
      return { success: ok };
    } catch (err) {
      return { error: err?.message || "Restore failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isPro: allowlistPro || purchasedPro,
    packages,
    loading,
    purchase,
    restore,
    refresh,
    supported: isSubscriptionSupported(),
  };
}
