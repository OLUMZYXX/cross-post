import Toggle from "@/components/settings/Toggle";
import { tiktokContentLabel } from "@/config/tiktok";

function CheckRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-cp-deep">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[var(--cp-accent)]"
      />
      <span>
        <span className="block text-cp-ink text-sm font-semibold">{label}</span>
        <span className="block text-cp-muted text-xs">{description}</span>
      </span>
    </label>
  );
}

export default function TikTokDisclosure({ settings, onChange }) {
  const label = tiktokContentLabel(settings);

  return (
    <section>
      <p className="cp-eyebrow mb-2.5">Content disclosure</p>
      <div className="rounded-2xl border border-cp-rule divide-y divide-cp-rule overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1">
            <p className="text-cp-ink text-sm font-semibold">Disclose post content</p>
            <p className="text-cp-muted text-xs">
              Turn on to disclose that this post promotes goods or services in exchange for something of value.
            </p>
          </div>
          <Toggle
            checked={settings.discloseContent}
            onChange={() => onChange({ discloseContent: !settings.discloseContent })}
            label="Disclose post content"
          />
        </div>
        {settings.discloseContent ? (
          <>
            <CheckRow
              label="Your brand"
              description="You are promoting yourself or your own business."
              checked={settings.yourBrand}
              onChange={(yourBrand) => onChange({ yourBrand })}
            />
            <CheckRow
              label="Branded content"
              description="You are promoting another brand or a third party."
              checked={settings.brandedContent}
              onChange={(brandedContent) => onChange({ brandedContent })}
            />
          </>
        ) : null}
      </div>
      {label ? <p className="text-cp-muted text-xs mt-2 ml-1">{label}</p> : null}
    </section>
  );
}
