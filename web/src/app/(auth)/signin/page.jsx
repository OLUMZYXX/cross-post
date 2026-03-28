"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 md:px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-300 text-[11px] md:text-xs mb-6 md:mb-8 transition-colors"
        >
          <ArrowLeft size={12} />
          Home
        </Link>

        <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1 font-headline">
          Sign in
        </h1>
        <p className="text-neutral-500 text-xs md:text-sm mb-5 md:mb-6">
          Welcome back to Cross-Post
        </p>

        {!tempToken ? (
          <form onSubmit={handleSubmit} className="space-y-3">
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full mt-1"
              size="md"
            >
              Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={handle2FA} className="space-y-3">
            <p className="text-neutral-400 text-xs md:text-sm mb-2">
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
              className="w-full mt-1"
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

        <p className="text-neutral-500 text-xs md:text-sm text-center mt-5 md:mt-6">
          No account?{" "}
          <Link href="/signup" className="text-white hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
