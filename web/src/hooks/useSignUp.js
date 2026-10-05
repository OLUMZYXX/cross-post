"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function useSignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const validate = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Enter your name";
    if (!email.trim()) nextErrors.email = "Enter your email";
    else if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Create a password";
    else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords don't match";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      router.push("/dashboard");
    } catch (error) {
      showToast({ type: "error", title: error.message || "Sign up failed" });
    } finally {
      setLoading(false);
    }
  };

  return {
    fields: { name, email, password, confirmPassword },
    setters: { setName, setEmail, setPassword, setConfirmPassword },
    errors,
    loading,
    submit,
  };
}
