"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Sparkles,
  Save,
  Send,
  Clock,
  X,
  Loader2,
  Check,
} from "lucide-react";
import usePostsData from "@/hooks/usePostsData";
import useCreatePost from "@/hooks/useCreatePost";
import { PLATFORM_CONFIG } from "@/config/platforms";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

const TONES = ["casual", "professional", "funny", "bold", "friendly", "formal"];

export default function CreatePostPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const { connectedNames, loading: loadingData } = usePostsData();
  const [showRephrase, setShowRephrase] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const {
    caption,
    setCaption,
    selectedPlatforms,
    togglePlatform,
    mediaUrls,
    handleMediaSelect,
    removeMedia,
    isUploading,
    isPosting,
    hasTwitterSelected,
    isRephrasing,
    rephrasedText,
    selectedTone,
    handleRephrase,
    applyRephrase,
    publishNow,
    schedulePost,
    saveDraft,
  } = useCreatePost({
    connectedPlatforms: connectedNames,
    onSuccess: () => router.push("/posts"),
  });

  if (loadingData) return <Spinner className="py-20" />;

  const charCount = caption.length;
  const isOverLimit = hasTwitterSelected && charCount > 280;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">
          Create Post
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={saveDraft}
            disabled={isPosting}
          >
            <Save size={14} /> Draft
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSchedule(true)}
            disabled={isPosting}
          >
            <Clock size={14} /> Schedule
          </Button>
          <Button
            variant="green"
            size="sm"
            onClick={publishNow}
            loading={isPosting}
            disabled={isUploading}
          >
            <Send size={14} /> Publish
          </Button>
        </div>
      </div>

      <div className="glass rounded-2xl mb-4">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          disabled={isPosting}
          className="w-full bg-transparent text-white text-sm p-4 min-h-[160px] resize-none outline-none placeholder-neutral-600"
        />

        {hasTwitterSelected && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-neutral-800">
              <div
                className={`h-full rounded-full transition-all ${isOverLimit ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${Math.min((charCount / 280) * 100, 100)}%` }}
              />
            </div>
            <span
              className={`text-[11px] ${isOverLimit ? "text-red-400" : "text-neutral-600"}`}
            >
              {charCount}/280
            </span>
          </div>
        )}

        {mediaUrls.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {mediaUrls.map((url, i) => (
              <div
                key={i}
                className="relative group w-20 h-20 rounded-lg overflow-hidden bg-neutral-800"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {isUploading && (
              <div className="w-20 h-20 rounded-lg bg-neutral-800 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-neutral-500" />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 px-3 py-2 border-t border-white/[0.06]">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleMediaSelect(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isPosting}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all duration-200"
          >
            <ImagePlus size={14} /> Media
          </button>
          <button
            onClick={() => setShowRephrase(true)}
            disabled={isPosting}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all duration-200"
          >
            <Sparkles size={14} /> AI Rephrase
          </button>
          <div className="flex-1" />
          <span className="text-neutral-600 text-[11px]">{charCount}</span>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-white text-sm font-semibold mb-3">Platforms</h3>
        {connectedNames.length === 0 ? (
          <p className="text-neutral-500 text-xs">
            No platforms connected. Go to Settings to connect.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {connectedNames.map((name) => {
              const config = PLATFORM_CONFIG[name.toLowerCase()] || {};
              const selected = selectedPlatforms.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => togglePlatform(name)}
                  disabled={isPosting}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all duration-200 border ${
                    selected
                      ? "bg-white/[0.06] border-white/[0.1] text-white"
                      : "bg-transparent border-white/[0.06] text-neutral-500 hover:border-white/[0.1] hover:text-white"
                  }`}
                >
                  {selected && <Check size={12} className="text-green-400" />}
                  {config.label || name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={showRephrase}
        onClose={() => setShowRephrase(false)}
        title="AI Rephrase"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {TONES.map((tone) => (
            <button
              key={tone}
              onClick={() => handleRephrase(tone)}
              disabled={isRephrasing}
              className={`px-3 py-1.5 rounded-xl text-xs capitalize border transition-all duration-200 ${
                selectedTone === tone
                  ? "bg-white/[0.06] border-white/[0.1] text-white"
                  : "border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
        {isRephrasing && <Spinner className="py-4" size={18} />}
        {rephrasedText && (
          <div className="space-y-3">
            <p className="text-neutral-300 text-sm bg-white/[0.04] rounded-xl p-3">
              {rephrasedText}
            </p>
            <Button
              size="sm"
              onClick={() => {
                applyRephrase();
                setShowRephrase(false);
              }}
            >
              Apply
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        title="Schedule Post"
      >
        <input
          type="datetime-local"
          value={scheduleDate}
          onChange={(e) => setScheduleDate(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-white/[0.15] transition-all duration-200 mb-4"
        />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSchedule(false)}
          >
            Cancel
          </Button>
          <Button
            variant="green"
            size="sm"
            loading={isPosting}
            onClick={() => {
              if (scheduleDate) {
                schedulePost(new Date(scheduleDate));
                setShowSchedule(false);
              }
            }}
          >
            Schedule
          </Button>
        </div>
      </Modal>
    </div>
  );
}
