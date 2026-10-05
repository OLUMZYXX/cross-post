"use client";

import { useState } from "react";
import { postAPI } from "@/services/postService";
import { useToast } from "@/context/ToastContext";

export default function usePostActions({ deletePost, refresh }) {
  const { showToast } = useToast();
  const [retryingId, setRetryingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const remove = async (id) => {
    setDeletingId(id);
    try {
      await deletePost(id);
      showToast({ type: "success", title: "Post deleted" });
    } catch {
      showToast({ type: "error", title: "Couldn't delete that post" });
    } finally {
      setDeletingId(null);
    }
  };

  const retry = async (id, failedPlatforms) => {
    setRetryingId(id);
    try {
      await postAPI.retry(id, failedPlatforms);
      showToast({ type: "success", title: "Retrying the failed platforms" });
      refresh();
    } catch (error) {
      showToast({ type: "error", title: error.message || "Retry failed" });
    } finally {
      setRetryingId(null);
    }
  };

  return { remove, retry, retryingId, deletingId };
}
