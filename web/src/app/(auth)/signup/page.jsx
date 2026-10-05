"use client";

import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";
import AuthSubmit from "@/components/auth/AuthSubmit";
import useSignUp from "@/hooks/useSignUp";

const SHOWCASE = {
  heading: "Write it once. Post it everywhere.",
  screen: "/images/app/ai-tailor.webp",
  screenAlt: "Cross-Post tailoring one caption for Twitter, Instagram and LinkedIn",
};

export default function SignUpPage() {
  const { fields, setters, errors, loading, submit } = useSignUp();

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free to start, with 7 days of Pro included."
      showcase={SHOWCASE}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="text-leaf font-semibold underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <AuthField
          label="Name"
          autoComplete="name"
          placeholder="Your name"
          value={fields.name}
          onChange={(event) => setters.setName(event.target.value)}
          error={errors.name}
        />
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={fields.email}
          onChange={(event) => setters.setEmail(event.target.value)}
          error={errors.email}
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={fields.password}
          onChange={(event) => setters.setPassword(event.target.value)}
          error={errors.password}
        />
        <AuthField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Type it again"
          value={fields.confirmPassword}
          onChange={(event) => setters.setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
        />
        <div className="pt-2">
          <AuthSubmit loading={loading}>Create account</AuthSubmit>
        </div>
        <p className="text-ink-muted text-sm text-center leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  );
}
