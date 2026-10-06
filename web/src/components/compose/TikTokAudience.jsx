import { TIKTOK_PRIVACY_LABELS } from "@/config/tiktok";

export default function TikTokAudience({ options, value, brandedContent, onChange }) {
  return (
    <fieldset>
      <legend className="cp-eyebrow mb-2.5">Who can view this post</legend>
      <div className="rounded-2xl border border-cp-rule divide-y divide-cp-rule overflow-hidden">
        {options.map((level) => {
          const locked = brandedContent && level === "SELF_ONLY";
          return (
            <label
              key={level}
              className={`flex items-center gap-3 px-4 py-3 ${locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-cp-deep"}`}
            >
              <input
                type="radio"
                name="tiktok-privacy"
                value={level}
                checked={value === level}
                disabled={locked}
                onChange={() => onChange(level)}
                className="w-4 h-4 accent-[var(--cp-accent)]"
              />
              <span className="flex-1">
                <span className="block text-cp-ink text-sm font-semibold">{TIKTOK_PRIVACY_LABELS[level] || level}</span>
                {locked ? (
                  <span className="block text-cp-muted text-xs">Branded content visibility can&apos;t be set to Only me.</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
