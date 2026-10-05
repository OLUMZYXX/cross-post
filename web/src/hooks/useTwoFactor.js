"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authAPI } from "@/services/authService";

const CODE_PATTERN = /^\d{6}$/;

export default function useTwoFactor() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const enabled = Boolean(user?.twoFactorEnabled);

  const updateCode = (value) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
    setError("");
  };

  const start = async () => {
    setBusy(true);
    try {
      const { data } = await authAPI.setup2FA();
      setSetup({ qrCode: data?.qrCode, secret: data?.secret });
    } catch (err) {
      showToast({ type: "error", title: err.message || "Couldn't start setup" });
    } finally {
      setBusy(false);
    }
  };

  const submit = async (action) => {
    if (!CODE_PATTERN.test(code)) {
      setError("Enter the 6-digit code from your app");
      return;
    }
    setBusy(true);
    try {
      if (action === "enable") await authAPI.verify2FA(code);
      else await authAPI.disable2FA(code);
      showToast({ type: "success", title: action === "enable" ? "Two-factor is on" : "Two-factor is off" });
      setSetup(null);
      setCode("");
      refreshUser();
    } catch (err) {
      setError(err.message || "That code didn't work");
    } finally {
      setBusy(false);
    }
  };

  return {
    enabled,
    setup,
    code,
    busy,
    error,
    updateCode,
    start,
    cancel: () => setSetup(null),
    enable: () => submit("enable"),
    disable: () => submit("disable"),
  };
}
