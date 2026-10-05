"use client";

import { useEffect, useState } from "react";
import { Check, X, RotateCcw, Trash2, Clock, Loader2 } from "lucide-react";
import { platformIcon, platformLabel } from "@/config/platformIcons";

function ResultPill({ result }) {
  const Icon = platformIcon(result.platform);
  return (
    <span
      title={result.success ? "Published" : result.error}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        result.success ? "bg-cp-olive-soft text-cp-olive" : "bg-cp-accent-soft text-cp-accent"
      }`}
    >
      <Icon size={12} />
      {platformLabel(result.platform)}
      {result.success ? <Check size={12} strokeWidth={2.5} /> : <X size={12} strokeWidth={2.5} />}
    </span>
  );
}

function PlannedPill({ name }) {
  const Icon = platformIcon(name);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cp-rule px-2.5 py-1 text-xs font-semibold text-cp-ink">
      <Icon size={12} />
      {platformLabel(name)}
    </span>
  );
}

function DeleteButton({ busy, onConfirm }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      disabled={busy}
      aria-label={armed ? "Confirm delete" : "Delete post"}
      className={`cp-press inline-flex items-center gap-1.5 h-9 rounded-full text-xs font-semibold transition-colors ${
        armed ? "px-3 bg-cp-accent text-white" : "w-9 justify-center text-cp-muted hover:text-cp-accent hover:bg-cp-deep"
      }`}
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      {armed && !busy ? "Delete?" : null}
    </button>
  );
}

export default function PostCard({ post, actions }) {
  const results = post.publishResults || [];
  const failed = results.filter((result) => !result.success);
  const when = post.publishedAt || post.scheduledAt || post.createdAt;

  return (
    <article className="rounded-3xl bg-cp-card border border-cp-rule p-5">
      <div className="flex items-start gap-4">
        <p className="flex-1 min-w-0 text-cp-ink text-[15px] leading-relaxed whitespace-pre-line">
          {post.caption || <span className="text-cp-soft italic">No caption</span>}
        </p>
        <DeleteButton busy={actions.deletingId === post._id} onConfirm={() => actions.remove(post._id)} />
      </div>

      {post.media?.length > 0 ? (
        <div className="flex gap-2 mt-4">
          {post.media.slice(0, 4).map((url, index) => (
            <img key={url} src={url} alt={`Attachment ${index + 1}`} className="w-16 h-16 rounded-2xl object-cover bg-cp-deep" />
          ))}
          {post.media.length > 4 ? (
            <span className="w-16 h-16 rounded-2xl bg-cp-deep flex items-center justify-center text-cp-muted text-sm font-semibold">
              +{post.media.length - 4}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 pt-4 cp-dashed flex flex-wrap items-center gap-2">
        {results.length > 0
          ? results.map((result) => <ResultPill key={result.platform} result={result} />)
          : (post.platforms || []).map((name) => <PlannedPill key={name} name={name} />)}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-cp-soft text-xs">
          {post.status === "scheduled" ? <Clock size={13} /> : null}
          {when
            ? new Date(when).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
            : ""}
        </span>
        {failed.length > 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-cp-accent text-xs">{failed[0].error}</span>
            <button
              type="button"
              onClick={() => actions.retry(post._id, failed.map((result) => result.platform))}
              disabled={actions.retryingId === post._id}
              className="cp-press inline-flex items-center gap-1.5 rounded-full border border-cp-rule px-3 py-1.5 text-xs font-semibold text-cp-ink hover:bg-cp-deep disabled:opacity-60"
            >
              {actions.retryingId === post._id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
              Retry {failed.length > 1 ? `${failed.length}` : platformLabel(failed[0].platform)}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
