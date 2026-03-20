"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authAPI } from "@/services/authService";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      await authAPI.updateProfile(name, email);
      updateUser({ name, email });
      showToast({ type: "success", title: "Profile updated" });
    } catch (err) {
      showToast({ type: "error", title: err.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings" className="text-neutral-500 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-white font-headline">Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" loading={saving} size="md">Save Changes</Button>
      </form>
    </div>
  );
}
