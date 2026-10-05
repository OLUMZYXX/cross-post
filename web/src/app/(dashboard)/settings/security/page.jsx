"use client";

import { ShieldCheck, ShieldOff } from "lucide-react";
import useTwoFactor from "@/hooks/useTwoFactor";
import SubPageHeader from "@/components/settings/SubPageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function CodeForm({ twoFactor, actionLabel, onSubmit, variant }) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col sm:flex-row gap-2.5 sm:items-start"
    >
      <Input
        label="6-digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        value={twoFactor.code}
        onChange={(event) => twoFactor.updateCode(event.target.value)}
        error={twoFactor.error}
        className="flex-1"
      />
      <Button type="submit" variant={variant} size="md" loading={twoFactor.busy} className="sm:mt-[26px]">
        {actionLabel}
      </Button>
    </form>
  );
}

export default function SecurityPage() {
  const twoFactor = useTwoFactor();
  const StatusIcon = twoFactor.enabled ? ShieldCheck : ShieldOff;

  return (
    <div className="animate-fade-in max-w-lg">
      <SubPageHeader title="Privacy & security" subtitle="Keep your account and connected platforms safe." />

      <section className="rounded-3xl bg-cp-card border border-cp-rule p-6">
        <div className="flex items-start gap-4">
          <span
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              twoFactor.enabled ? "bg-cp-olive-soft text-cp-olive" : "bg-cp-deep text-cp-muted"
            }`}
          >
            <StatusIcon size={22} />
          </span>
          <div>
            <h2 className="font-display text-cp-ink text-xl font-semibold">Two-factor authentication</h2>
            <p className="text-cp-muted text-sm mt-1">
              {twoFactor.enabled
                ? "On. You'll need a code from your authenticator app to sign in."
                : "Add a second step at sign-in with an authenticator app."}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {twoFactor.enabled ? (
            <CodeForm twoFactor={twoFactor} actionLabel="Turn off" onSubmit={twoFactor.disable} variant="danger" />
          ) : twoFactor.setup ? (
            <div className="space-y-5">
              <p className="text-cp-muted text-sm">
                Scan this with Google Authenticator, 1Password or a similar app, then enter the code it shows.
              </p>
              {twoFactor.setup.qrCode ? (
                <img
                  src={twoFactor.setup.qrCode}
                  alt="Two-factor setup QR code"
                  className="w-48 h-48 rounded-2xl border border-cp-rule bg-white p-2"
                />
              ) : null}
              {twoFactor.setup.secret ? (
                <p className="text-cp-muted text-xs">
                  Can&apos;t scan? Enter this key instead:{" "}
                  <code className="text-cp-ink font-semibold break-all select-all">{twoFactor.setup.secret}</code>
                </p>
              ) : null}
              <CodeForm twoFactor={twoFactor} actionLabel="Turn on" onSubmit={twoFactor.enable} variant="accent" />
              <button type="button" onClick={twoFactor.cancel} className="text-cp-muted hover:text-cp-ink text-sm font-semibold">
                Cancel
              </button>
            </div>
          ) : (
            <Button variant="accent" size="md" loading={twoFactor.busy} onClick={twoFactor.start}>
              Set up two-factor
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
