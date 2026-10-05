"use client";

import { useState } from "react";
import { Send, CalendarClock, ChevronRight } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

function toLocalInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function presetDate(daysAhead, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function nextHour() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date;
}

const PRESETS = [
  { label: "In an hour", build: nextHour },
  { label: "Tonight 7 PM", build: () => presetDate(0, 19) },
  { label: "Tomorrow 9 AM", build: () => presetDate(1, 9) },
];

export default function ScheduleModal({ open, onClose, onPublishNow, onSchedule, busy }) {
  const [value, setValue] = useState(() => toLocalInput(nextHour()));
  const chosen = value ? new Date(value) : null;
  const isFuture = chosen && chosen.getTime() > Date.now();

  const submit = () => {
    if (!isFuture) return;
    onSchedule(chosen);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="When do you want to post?">
      <button
        type="button"
        onClick={() => {
          onClose();
          onPublishNow();
        }}
        disabled={busy}
        className="cp-chunky w-full flex items-center gap-3 rounded-2xl bg-cp-accent text-white px-4 py-3.5 text-left disabled:opacity-60"
      >
        <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
          <Send size={16} />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Post now</span>
          <span className="block text-xs text-white/75">Publish immediately to all selected platforms</span>
        </span>
        <ChevronRight size={18} />
      </button>

      <div className="mt-4 rounded-2xl border border-cp-rule p-4">
        <p className="flex items-center gap-2.5 font-semibold text-cp-ink">
          <span className="w-9 h-9 rounded-full bg-cp-deep flex items-center justify-center">
            <CalendarClock size={16} className="text-cp-muted" />
          </span>
          Schedule for later
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setValue(toLocalInput(preset.build()))}
              className="cp-press rounded-full border border-cp-rule bg-cp-card px-3 py-1.5 text-xs font-semibold text-cp-ink hover:border-cp-soft"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <label htmlFor="schedule-at" className="block text-cp-ink text-[13px] font-semibold mt-4 mb-1.5">
          Date and time
        </label>
        <input
          id="schedule-at"
          type="datetime-local"
          value={value}
          min={toLocalInput(new Date())}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-2xl border border-cp-rule bg-cp-card px-4 py-3 text-cp-ink text-sm outline-none focus:border-cp-ink"
        />
        {value && !isFuture ? (
          <p className="text-cp-accent text-xs mt-1.5">Pick a time in the future.</p>
        ) : null}
        <Button variant="primary" size="md" onClick={submit} disabled={!isFuture} loading={busy} className="w-full mt-4">
          {isFuture
            ? `Schedule · ${chosen.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
            : "Schedule"}
        </Button>
      </div>
    </Modal>
  );
}
