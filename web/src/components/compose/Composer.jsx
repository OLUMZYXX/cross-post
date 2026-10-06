"use client";

import { useState } from "react";
import { Send, Clock, Save } from "lucide-react";
import useCreatePost from "@/hooks/useCreatePost";
import useTikTokSettings from "@/hooks/useTikTokSettings";
import ComposeCard from "@/components/compose/ComposeCard";
import SendTo from "@/components/compose/SendTo";
import RephraseModal from "@/components/compose/RephraseModal";
import ScheduleModal from "@/components/compose/ScheduleModal";
import TikTokSettingsModal from "@/components/compose/TikTokSettingsModal";
import Button from "@/components/ui/Button";

export default function Composer({ platforms, connectedNames, onDone }) {
  const [showRephrase, setShowRephrase] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const composer = useCreatePost({ connectedPlatforms: connectedNames, onSuccess: onDone });
  const { isPosting, isUploading, selectedPlatforms } = composer;
  const nothingSelected = selectedPlatforms.length === 0;
  const tiktok = useTikTokSettings({ selectedPlatforms, mediaUrls: composer.mediaUrls });
  const publish = () => tiktok.runWithSettings((settings) => composer.publishNow(settings));
  const openSchedule = () => tiktok.runWithSettings(() => setShowSchedule(true));

  return (
    <div>
      <ComposeCard composer={composer} onOpenRephrase={() => setShowRephrase(true)} />

      <SendTo
        platforms={platforms}
        selected={selectedPlatforms}
        onToggle={composer.togglePlatform}
        disabled={isPosting}
      />

      <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
        <Button
          variant="accent"
          size="lg"
          onClick={publish}
          loading={isPosting}
          disabled={isUploading || nothingSelected}
          className="flex-1"
        >
          {!isPosting ? <Send size={17} /> : null}
          {nothingSelected ? "Choose where to post" : `Publish to ${selectedPlatforms.length}`}
        </Button>
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            size="lg"
            onClick={openSchedule}
            disabled={isPosting || isUploading || nothingSelected}
            className="flex-1"
          >
            <Clock size={17} /> Schedule
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={composer.saveDraft}
            disabled={isPosting || isUploading}
            className="flex-1"
            aria-label="Save draft"
          >
            <Save size={17} /> <span className="sm:hidden xl:inline">Draft</span>
          </Button>
        </div>
      </div>

      <RephraseModal open={showRephrase} onClose={() => setShowRephrase(false)} composer={composer} />
      <TikTokSettingsModal tiktok={tiktok} />
      <ScheduleModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        onPublishNow={() => composer.publishNow(tiktok.payload)}
        onSchedule={(date) => composer.schedulePost(date, tiktok.payload)}
        busy={isPosting}
      />
    </div>
  );
}
