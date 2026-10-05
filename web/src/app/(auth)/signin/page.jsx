"use client";

import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";
import AuthSubmit from "@/components/auth/AuthSubmit";
import useSignIn from "@/hooks/useSignIn";

const SHOWCASE = {
  heading: "Good to see you again.",
  screen: "/images/app/compose.webp",
  screenAlt: "The Cross-Post compose screen",
};

function CredentialsForm({ signIn }) {
  const { fields, setters, errors, loading, submitCredentials } = signIn;

  return (
    <form onSubmit={submitCredentials} noValidate className="space-y-5">
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
        autoComplete="current-password"
        placeholder="Your password"
        value={fields.password}
        onChange={(event) => setters.setPassword(event.target.value)}
        error={errors.password}
      />
      <div className="pt-2">
        <AuthSubmit loading={loading}>Sign in</AuthSubmit>
      </div>
    </form>
  );
}

function TwoFactorForm({ signIn }) {
  const { fields, setters, errors, loading, submitTwoFA, cancelTwoFA } = signIn;

  return (
    <form onSubmit={submitTwoFA} noValidate className="space-y-5">
      <AuthField
        label="Verification code"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        maxLength={6}
        value={fields.twoFACode}
        onChange={(event) => setters.setTwoFACode(event.target.value.replace(/\D/g, ""))}
        error={errors.twoFACode}
        hint="Open your authenticator app and enter the 6-digit code."
        autoFocus
      />
      <div className="pt-2 space-y-3">
        <AuthSubmit loading={loading}>Verify and continue</AuthSubmit>
        <button
          type="button"
          onClick={cancelTwoFA}
          className="w-full py-3 text-ink-soft hover:text-ink text-sm font-medium transition-colors"
        >
          Use a different account
        </button>
      </div>
    </form>
  );
}

export default function SignInPage() {
  const signIn = useSignIn();

  return (
    <AuthLayout
      title={signIn.needsTwoFA ? "Check your app" : "Welcome back"}
      subtitle={
        signIn.needsTwoFA
          ? "Two-factor authentication is on for this account."
          : "Sign in to pick up where you left off."
      }
      showcase={SHOWCASE}
      footer={
        <>
          New to Cross-Post?{" "}
          <Link href="/signup" className="text-leaf font-semibold underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      {signIn.needsTwoFA ? <TwoFactorForm signIn={signIn} /> : <CredentialsForm signIn={signIn} />}
    </AuthLayout>
  );
}
