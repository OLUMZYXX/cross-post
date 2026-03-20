"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignUpPage() {
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
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min 6 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      showToast({ type: "error", title: err.message || "Sign up failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-300 text-xs mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Home
        </Link>

        <h1 className="text-xl font-semibold text-white mb-1">Create account</h1>
        <p className="text-neutral-500 text-sm mb-6">Get started with Cross-Post</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Name" icon={User} placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <Input label="Password" type="password" icon={Lock} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
          <Input label="Confirm Password" type="password" icon={Lock} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />
          <Button type="submit" loading={loading} className="w-full mt-1" size="md">Create Account</Button>
        </form>

        <p className="text-neutral-500 text-sm text-center mt-6">
          Have an account?{" "}
          <Link href="/signin" className="text-white hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
