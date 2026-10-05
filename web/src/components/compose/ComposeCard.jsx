"use client";

import { useRef } from "react";
import { ImagePlus, Sparkles, X, Loader2, XCircle } from "lucide-react";

const TWITTER_LIMIT = 280;

function ToolButton({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cp-press inline-flex items-center gap-1.5 rounded-full border border-cp-rule bg-cp-paper px-3 py-1.5 text-xs font-semibold text-cp-ink hover:bg-cp-deep disabled:opacity-50 transition-colors"
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function MediaStrip({ mediaUrls, isUploading, onRemove }) {
  if (mediaUrls.length === 0 && !isUploading) return null;

  return (
    <div className="flex flex-wrap gap-2 px-5 pb-4">
      {mediaUrls.map((url, index) => (
        <div key={url} className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-cp-deep border border-cp-rule">
          <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove attachment ${index + 1}`}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 text-white flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ))}
      {isUploading ? (
        <div className="w-20 h-20 rounded-2xl bg-cp-deep border border-cp-rule flex items-center justify-center">
          <Loader2 size={18} className="animate-spin text-cp-muted" />
        </div>
      ) : null}
    </div>
  );
}

export default function ComposeCard({ composer, onOpenRephrase }) {
  const fileRef = useRef(null);
  const { caption, setCaption, mediaUrls, isUploading, isPosting, hasTwitterSelected } = composer;
  const charCount = caption.length;
  const overLimit = hasTwitterSelected && charCount > TWITTER_LIMIT;

  return (
    <div className="rounded-[28px] bg-cp-card border border-cp-rule overflow-hidden">
      <label htmlFor="compose-caption" className="sr-only">
        Caption
      </label>
      <textarea
        id="compose-caption"
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        placeholder="Say something worth crossing five timelines..."
        disabled={isPosting}
        rows={5}
        className="block w-full bg-transparent text-cp-ink text-[17px] leading-relaxed px-5 pt-5 pb-4 min-h-[150px] resize-y outline-none placeholder:text-cp-soft"
      />

      <MediaStrip mediaUrls={mediaUrls} isUploading={isUploading} onRemove={composer.removeMedia} />

      <div className="mx-5 cp-dashed" />
      <div className="flex items-center justify-between px-5 py-2.5">
        <span className="cp-eyebrow">Draft</span>
        <div className="flex items-center gap-3 text-xs text-cp-muted">
          {hasTwitterSelected ? (
            <span className={overLimit ? "text-cp-accent font-semibold" : ""}>
              X: {charCount}/{TWITTER_LIMIT}
            </span>
          ) : null}
          <span>
            <b className="text-cp-ink">{charCount}</b> characters
          </span>
          {charCount > 0 ? (
            <button
              type="button"
              onClick={composer.reset}
              disabled={isPosting}
              className="inline-flex items-center gap-1 pl-3 border-l border-cp-rule text-cp-accent font-semibold"
            >
              <XCircle size={13} /> Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-cp-rule">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(event) => {
            composer.handleMediaSelect(event.target.files);
            event.target.value = "";
          }}
        />
        <ToolButton icon={ImagePlus} label="Media" onClick={() => fileRef.current?.click()} disabled={isPosting} />
        <ToolButton icon={Sparkles} label="Rephrase" onClick={onOpenRephrase} disabled={isPosting} />
      </div>
    </div>
  );
}
