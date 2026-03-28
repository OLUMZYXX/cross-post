"use client";

import { useState } from "react";
import {
  Send,
  FileText,
  Clock,
  Trash2,
  RotateCcw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import usePostsData from "@/hooks/usePostsData";
import { postAPI } from "@/services/postService";
import { useToast } from "@/context/ToastContext";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

const TABS = [
  { key: "published", label: "Published", icon: Send },
  { key: "drafts", label: "Drafts", icon: FileText },
  { key: "scheduled", label: "Scheduled", icon: Clock },
];

export default function PostsPage() {
  const [tab, setTab] = useState("published");
  const {
    sentPosts,
    draftPosts,
    scheduledPosts,
    loading,
    refresh,
    deletePost,
  } = usePostsData();
  const { showToast } = useToast();
  const [retrying, setRetrying] = useState(null);
  const [deleting, setDeleting] = useState(null);

  if (loading) return <Spinner className="py-20" />;

  const posts =
    tab === "published"
      ? sentPosts
      : tab === "drafts"
        ? draftPosts
        : scheduledPosts;

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deletePost(id);
      showToast({ type: "success", title: "Post deleted" });
    } catch {
      showToast({ type: "error", title: "Delete failed" });
    } finally {
      setDeleting(null);
    }
  };

  const handleRetry = async (id, failedPlatforms) => {
    setRetrying(id);
    try {
      await postAPI.retry(id, failedPlatforms);
      showToast({ type: "success", title: "Retry sent" });
      refresh();
    } catch (err) {
      showToast({ type: "error", title: err.message || "Retry failed" });
    } finally {
      setRetrying(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white font-headline mb-3 sm:mb-4">
        Posts
      </h1>

      <div className="flex items-center gap-0.5 sm:gap-1 mb-4 sm:mb-5 border-b border-white/[0.04]">
        {TABS.map((t) => {
          const count =
            t.key === "published"
              ? sentPosts.length
              : t.key === "drafts"
                ? draftPosts.length
                : scheduledPosts.length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium border-b-2 transition-all duration-200 ${
                tab === t.key
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <t.icon size={12} className="sm:hidden" />
              <t.icon size={13} className="hidden sm:block" />
              {t.label}
              <span className="text-neutral-600 ml-0.5">{count}</span>
            </button>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-10 sm:py-16">
          <p className="text-neutral-500 text-xs sm:text-sm">No {tab} posts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => {
            const results = post.publishResults || [];
            const succeeded = results.filter((r) => r.success);
            const failed = results.filter((r) => !r.success);
            const schedDate = post.scheduledAt
              ? new Date(post.scheduledAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : null;

            return (
              <div key={post._id} className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs sm:text-sm mb-1 sm:mb-1.5 leading-relaxed">
                      {post.caption || "No caption"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {succeeded.length > 0 && (
                        <span className="flex items-center gap-1 text-green-400 text-[10px] sm:text-[11px]">
                          <CheckCircle size={10} /> {succeeded.length} sent
                        </span>
                      )}
                      {failed.length > 0 && (
                        <span className="flex items-center gap-1 text-red-400 text-[10px] sm:text-[11px]">
                          <AlertCircle size={10} /> {failed.length} failed
                        </span>
                      )}
                      {schedDate && (
                        <span className="text-blue-400 text-[10px] sm:text-[11px]">
                          {schedDate}
                        </span>
                      )}
                      {post.platforms?.length > 0 && (
                        <span className="text-neutral-600 text-[10px] sm:text-[11px]">
                          {post.platforms
                            .map((p) => p.split(":")[0])
                            .join(", ")}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="text-neutral-600 text-[10px] sm:text-[11px]">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    {failed.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={retrying === post._id}
                        onClick={() =>
                          handleRetry(
                            post._id,
                            failed.map((r) => r.platform),
                          )
                        }
                      >
                        <RotateCcw size={11} /> Retry
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deleting === post._id}
                      onClick={() => handleDelete(post._id)}
                    >
                      <Trash2 size={11} />
                    </Button>
                  </div>
                </div>

                {post.media?.length > 0 && (
                  <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                    {post.media.slice(0, 4).map((url, i) => (
                      <div
                        key={i}
                        className="w-11 h-11 sm:w-14 sm:h-14 rounded-md sm:rounded-lg overflow-hidden bg-white/[0.04]"
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {post.media.length > 4 && (
                      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-md sm:rounded-lg bg-white/[0.04] flex items-center justify-center text-neutral-500 text-[10px] sm:text-xs">
                        +{post.media.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
