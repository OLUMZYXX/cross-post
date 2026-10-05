"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [tempToken, setTempToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, verify2FA } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Enter your email";
    else if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Enter your password";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitCredentials = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.requires2FA) setTempToken(result.tempToken);
      else router.push("/dashboard");
    } catch (error) {
      showToast({ type: "error", title: error.message || "Sign in failed" });
    } finally {
      setLoading(false);
    }
  };

  const submitTwoFA = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(twoFACode.trim())) {
      setErrors({ twoFACode: "Enter the 6-digit code" });
      return;
    }
    setLoading(true);
    try {
      await verify2FA(tempToken, twoFACode.trim());
      router.push("/dashboard");
    } catch (error) {
      showToast({ type: "error", title: error.message || "Invalid code" });
    } finally {
      setLoading(false);
    }
  };

  const cancelTwoFA = () => {
    setTempToken(null);
    setTwoFACode("");
    setErrors({});
  };

  return {
    fields: { email, password, twoFACode },
    setters: { setEmail, setPassword, setTwoFACode },
    errors,
    loading,
    needsTwoFA: Boolean(tempToken),
    submitCredentials,
    submitTwoFA,
    cancelTwoFA,
  };
}
