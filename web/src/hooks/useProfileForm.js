"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authAPI } from "@/services/authService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useProfileForm() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const dirty = name.trim() !== (user?.name || "") || email.trim() !== (user?.email || "");

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Enter your name";
    if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Enter a valid email";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await authAPI.updateProfile(name.trim(), email.trim());
      updateUser({ name: name.trim(), email: email.trim() });
      showToast({ type: "success", title: "Profile updated" });
    } catch (error) {
      showToast({ type: "error", title: error.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  return { name, email, setName, setEmail, errors, saving, dirty, save };
}
