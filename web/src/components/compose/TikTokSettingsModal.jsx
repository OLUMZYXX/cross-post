import { Music2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Toggle from "@/components/settings/Toggle";
import TikTokAudience from "@/components/compose/TikTokAudience";
import TikTokDisclosure from "@/components/compose/TikTokDisclosure";
import { TIKTOK_MUSIC_POLICY_URL, TIKTOK_BRANDED_POLICY_URL } from "@/config/tiktok";

function Interaction({ label, checked, disabled, onChange }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${disabled ? "opacity-40" : ""}`}>
      <span className="text-cp-ink text-sm font-semibold">{label}</span>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} label={`Allow ${label.toLowerCase()}`} />
    </div>
  );
}

function PolicyLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cp-ink font-semibold underline underline-offset-2">
      {children}
    </a>
  );
}

function SettingsForm({ tiktok }) {
  const { creator, settings, update, isVideo } = tiktok;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {creator.avatarUrl ? (
          <img src={creator.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover" />
        ) : (
          <span className="w-11 h-11 rounded-full bg-cp-deep flex items-center justify-center">
            <Music2 size={18} className="text-cp-ink" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-cp-muted text-xs">Posting to TikTok as</p>
          <p className="text-cp-ink font-semibold truncate">{creator.nickname}</p>
        </div>
      </div>

      <TikTokAudience
        options={creator.privacyOptions}
        value={settings.privacyLevel}
        brandedContent={settings.brandedContent}
        onChange={(privacyLevel) => update({ privacyLevel })}
      />

      <section>
        <p className="cp-eyebrow mb-2.5">Allow users to</p>
        <div className="rounded-2xl border border-cp-rule divide-y divide-cp-rule">
          <Interaction label="Comment" checked={settings.allowComment} disabled={creator.commentDisabled} onChange={() => update({ allowComment: !settings.allowComment })} />
          {isVideo ? (
            <>
              <Interaction label="Duet" checked={settings.allowDuet} disabled={creator.duetDisabled} onChange={() => update({ allowDuet: !settings.allowDuet })} />
              <Interaction label="Stitch" checked={settings.allowStitch} disabled={creator.stitchDisabled} onChange={() => update({ allowStitch: !settings.allowStitch })} />
            </>
          ) : null}
        </div>
      </section>

      <TikTokDisclosure settings={settings} onChange={update} />

      <p className="text-cp-muted text-xs leading-relaxed">
        By posting, you agree to TikTok&apos;s{" "}
        {settings.brandedContent ? (
          <>
            <PolicyLink href={TIKTOK_BRANDED_POLICY_URL}>Branded Content Policy</PolicyLink> and{" "}
          </>
        ) : null}
        <PolicyLink href={TIKTOK_MUSIC_POLICY_URL}>Music Usage Confirmation</PolicyLink>. It may take a few minutes for
        the post to appear on your profile.
      </p>
    </div>
  );
}

export default function TikTokSettingsModal({ tiktok }) {
  return (
    <Modal open={tiktok.visible} onClose={tiktok.close} eyebrow="TikTok" title="Post settings">
      {tiktok.loadError ? (
        <div className="text-center py-6">
          <p className="text-cp-accent text-sm">{tiktok.loadError}</p>
          <Button variant="secondary" size="sm" onClick={tiktok.retry} className="mt-4">
            Try again
          </Button>
        </div>
      ) : !tiktok.creator ? (
        <Spinner className="py-12" />
      ) : (
        <>
          <SettingsForm tiktok={tiktok} />
          {tiktok.problem ? <p className="text-cp-accent text-xs mt-5">{tiktok.problem}</p> : null}
          <Button variant="accent" size="md" onClick={tiktok.confirm} disabled={Boolean(tiktok.problem)} className="w-full mt-4">
            Continue
          </Button>
        </>
      )}
    </Modal>
  );
}
