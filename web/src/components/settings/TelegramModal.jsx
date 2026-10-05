"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function TelegramModal({ open, onClose, onConnect, busy }) {
  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!/^\d+:[\w-]{20,}$/.test(botToken.trim())) nextErrors.botToken = "That doesn't look like a bot token";
    if (!channelId.trim()) nextErrors.channelId = "Enter your channel username or ID";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const connected = await onConnect(botToken, channelId);
    if (connected) {
      setBotToken("");
      setChannelId("");
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} eyebrow="Connect" title="Telegram channel">
      <p className="text-cp-muted text-sm mb-5">
        Create a bot with @BotFather, add it to your channel as an admin, then paste its token and the channel below.
      </p>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input
          label="Bot token"
          placeholder="123456789:AA..."
          autoComplete="off"
          value={botToken}
          onChange={(event) => setBotToken(event.target.value)}
          error={errors.botToken}
        />
        <Input
          label="Channel"
          placeholder="@yourchannel or -1001234567890"
          autoComplete="off"
          value={channelId}
          onChange={(event) => setChannelId(event.target.value)}
          error={errors.channelId}
        />
        <Button type="submit" variant="accent" size="md" loading={busy} className="w-full">
          Connect Telegram
        </Button>
      </form>
    </Modal>
  );
}
