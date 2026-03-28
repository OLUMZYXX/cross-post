"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowLeft, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AuthPanel from "@/components/auth/AuthPanel";

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
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords don't match";
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
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AuthPanel
        title="Get started"
        subtitle="Create your account and start posting to all your platforms at once."
      />

      <div className="w-full md:w-1/2 flex items-center justify-center px-5 sm:px-8 py-12 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[100px] md:hidden" />

        <div className="w-full max-w-[400px] relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-300 text-xs mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>

          <div className="flex items-center gap-3 mb-2 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Share2 size={16} className="text-black" />
            </div>
            <span className="text-white font-bold text-sm">Cross-Post</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 tracking-tight font-headline">
            Create account
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            Get started with Cross-Post
          </p>

          <div className="glass rounded-2xl p-5 sm:p-7 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                icon={User}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              <Input
                label="Confirm Password"
                type="password"
                icon={Lock}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
              />
              <Button
                type="submit"
                loading={loading}
                variant="green"
                className="w-full mt-2"
                size="md"
              >
                Create Account
              </Button>
            </form>
          </div>

          <p className="text-neutral-500 text-sm text-center mt-6">
            Have an account?{" "}
            <Link
              href="/signin"
              className="text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
