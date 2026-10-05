"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import useConnectedAccounts from "@/hooks/useConnectedAccounts";
import SubPageHeader from "@/components/settings/SubPageHeader";
import AccountCard from "@/components/settings/AccountCard";
import AddPlatformList from "@/components/settings/AddPlatformList";
import TelegramModal from "@/components/settings/TelegramModal";
import EmptyState from "@/components/app/EmptyState";
import Spinner from "@/components/ui/Spinner";
import { CONNECTABLE_PLATFORMS } from "@/config/connectablePlatforms";

export default function AccountsPage() {
  const [showTelegram, setShowTelegram] = useState(false);
  const accounts = useConnectedAccounts();

  if (accounts.loading) return <Spinner className="py-24" />;

  const connectedNames = new Set(accounts.platforms.map((platform) => platform.name));
  const addable = CONNECTABLE_PLATFORMS.filter(
    (platform) => platform.allowMultiple || !connectedNames.has(platform.name),
  ).map((platform) => ({ ...platform, isConnected: connectedNames.has(platform.name) }));

  const handleSelect = (platform) => {
    if (platform.manual) setShowTelegram(true);
    else accounts.connect(platform);
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <SubPageHeader
        title="Connected accounts"
        subtitle={`${accounts.platforms.length} connected. Posts can go to any of them.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <section>
          <p className="cp-eyebrow mb-2.5 ml-1">Connected</p>
          <div className="rounded-3xl bg-cp-card border border-cp-rule divide-y divide-cp-rule">
            {accounts.platforms.length === 0 ? (
              <EmptyState icon={Link2} title="No accounts yet" body="Connect a platform to start posting to it." />
            ) : (
              accounts.platforms.map((platform) => (
                <AccountCard key={platform._id} platform={platform} onDisconnect={accounts.disconnect} />
              ))
            )}
          </div>
        </section>

        {addable.length > 0 ? (
          <section>
            <p className="cp-eyebrow !text-cp-accent mb-2.5 ml-1">Add a platform</p>
            <AddPlatformList platforms={addable} connecting={accounts.connecting} onSelect={handleSelect} />
            <p className="text-cp-soft text-xs mt-3 ml-1">
              You&apos;ll sign in on the platform&apos;s own page. We never see your password.
            </p>
          </section>
        ) : null}
      </div>

      <TelegramModal
        open={showTelegram}
        onClose={() => setShowTelegram(false)}
        onConnect={accounts.connectTelegram}
        busy={accounts.connecting === "Telegram"}
      />
    </div>
  );
}
