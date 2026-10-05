import { RotateCcw, Check, X as XIcon } from "lucide-react";

const CAPTIONS = [
  { platform: "LinkedIn", text: "We've reworked our checkout so orders take half the time. Here's what changed and why." },
  { platform: "X", text: "Checkout is now twice as fast. Try it and tell us what you think." },
  { platform: "Instagram", text: "Faster checkout just landed. Tap the link in bio and see for yourself." },
];

const WEEK = [
  { day: "Mon", posts: 1 },
  { day: "Tue", posts: 0 },
  { day: "Wed", posts: 2 },
  { day: "Thu", posts: 1 },
  { day: "Fri", posts: 3 },
  { day: "Sat", posts: 0 },
  { day: "Sun", posts: 1 },
];

export function CaptionVisual() {
  return (
    <div className="space-y-2.5">
      {CAPTIONS.map((caption) => (
        <div key={caption.platform} className="rounded-xl bg-white border border-line px-4 py-3">
          <p className="text-[11px] font-semibold text-leaf uppercase tracking-wide">
            {caption.platform}
          </p>
          <p className="text-ink text-sm mt-1 leading-snug">{caption.text}</p>
        </div>
      ))}
    </div>
  );
}

export function ScheduleVisual() {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {WEEK.map((entry) => (
        <div key={entry.day} className="rounded-lg bg-white/[0.06] px-1 py-2.5 text-center">
          <p className="text-white/60 text-[11px]">{entry.day}</p>
          <div className="mt-2 flex flex-col items-center gap-1 min-h-[26px]">
            {Array.from({ length: entry.posts }).map((_, index) => (
              <span key={index} className="w-4 h-1.5 rounded-full bg-mint" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusVisual() {
  return (
    <div className="rounded-xl bg-white border border-line divide-y divide-line text-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-ink">Instagram</span>
        <span className="flex items-center gap-1 text-leaf text-xs font-medium">
          <Check size={13} strokeWidth={2.5} /> Published
        </span>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-ink">Facebook</span>
        <span className="flex items-center gap-1 text-leaf text-xs font-medium">
          <Check size={13} strokeWidth={2.5} /> Published
        </span>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <span className="text-ink">X</span>
          <p className="flex items-center gap-1 text-[#b4432f] text-xs mt-0.5">
            <XIcon size={12} /> Caption over 280 characters
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-ink text-xs">
          <RotateCcw size={11} /> Retry
        </span>
      </div>
    </div>
  );
}
