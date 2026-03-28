"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AuthPanel from "@/components/auth/AuthPanel";

export default function SignInPage() {
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
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    if (!password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requires2FA) setTempToken(result.tempToken);
      else router.push("/dashboard");
    } catch (err) {
      showToast({ type: "error", title: err.message || "Sign in failed" });
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    if (!twoFACode.trim()) return;
    setLoading(true);
    try {
      await verify2FA(tempToken, twoFACode);
      router.push("/dashboard");
    } catch (err) {
      showToast({ type: "error", title: err.message || "Invalid code" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AuthPanel
        title="Welcome back"
        subtitle="Sign in to manage all your social platforms from one powerful dashboard."
      />

      <div className="w-full md:w-1/2 flex items-center justify-center px-5 sm:px-8 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[100px] md:hidden" />

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
            Sign in
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            Welcome back to Cross-Post
          </p>

          <div className="glass rounded-2xl p-5 sm:p-7 animate-fade-in-up">
            {!tempToken ? (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
                <Button
                  type="submit"
                  loading={loading}
                  variant="green"
                  className="w-full mt-2"
                  size="md"
                >
                  Sign In
                </Button>
              </form>
            ) : (
              <form onSubmit={handle2FA} className="space-y-4">
                <p className="text-neutral-400 text-sm mb-1">
                  Enter the 6-digit code from your authenticator app.
                </p>
                <Input
                  label="2FA Code"
                  placeholder="000000"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  maxLength={6}
                />
                <Button
                  type="submit"
                  loading={loading}
                  variant="green"
                  className="w-full mt-2"
                  size="md"
                >
                  Verify
                </Button>
                <button
                  type="button"
                  onClick={() => setTempToken(null)}
                  className="w-full text-neutral-500 hover:text-neutral-300 text-xs mt-2 transition-colors"
                >
                  Back to sign in
                </button>
              </form>
            )}
          </div>

          <p className="text-neutral-500 text-sm text-center mt-6">
            No account?{" "}
            <Link
              href="/signup"
              className="text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
