"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, ShieldOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authAPI } from "@/services/authService";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SecurityPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [setupLoading, setSetupLoading] = useState(false);
  const [qrUri, setQrUri] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");

  const handle2FASetup = async () => {
    setSetupLoading(true);
    try {
      const { data } = await authAPI.setup2FA();
      setQrUri(data.otpauthUrl || data.qrCodeUrl);
    } catch (err) {
      showToast({ type: "error", title: err.message || "Setup failed" });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()) return;
    try {
      await authAPI.verify2FA(verifyCode);
      showToast({ type: "success", title: "2FA enabled" });
      setQrUri(null);
      setVerifyCode("");
      refreshUser();
    } catch (err) {
      showToast({ type: "error", title: err.message || "Verification failed" });
    }
  };

  const handleDisable = async () => {
    if (!disableCode.trim()) return;
    try {
      await authAPI.disable2FA(disableCode);
      showToast({ type: "success", title: "2FA disabled" });
      setDisableCode("");
      refreshUser();
    } catch (err) {
      showToast({ type: "error", title: err.message || "Failed to disable" });
    }
  };

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings" className="text-neutral-500 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-white font-headline">Privacy & Security</h1>
      </div>

      <div className="glass rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          {user?.twoFactorEnabled ? (
            <Shield size={18} className="text-green-400" />
          ) : (
            <ShieldOff size={18} className="text-neutral-500" />
          )}
          <div>
            <p className="text-white text-sm font-medium">Two-Factor Authentication</p>
            <p className="text-neutral-500 text-[11px]">
              {user?.twoFactorEnabled ? "Enabled — your account is protected" : "Not enabled"}
            </p>
          </div>
        </div>

        {!user?.twoFactorEnabled && !qrUri && (
          <Button variant="secondary" size="sm" loading={setupLoading} onClick={handle2FASetup}>
            Enable 2FA
          </Button>
        )}

        {qrUri && (
          <div className="space-y-3 mt-3">
            <p className="text-neutral-400 text-xs">Scan the QR code with your authenticator app, then enter the 6-digit code.</p>
            <div className="bg-white p-3 rounded-lg inline-block">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUri)}`} alt="QR" className="w-44 h-44" />
            </div>
            <div className="flex gap-2">
              <Input placeholder="000000" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} maxLength={6} className="flex-1" />
              <Button size="md" onClick={handleVerify}>Verify</Button>
            </div>
          </div>
        )}

        {user?.twoFactorEnabled && (
          <div className="mt-3 space-y-2">
            <p className="text-neutral-500 text-xs">Enter your 2FA code to disable.</p>
            <div className="flex gap-2">
              <Input placeholder="000000" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} maxLength={6} className="flex-1" />
              <Button variant="danger" size="md" onClick={handleDisable}>Disable</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
