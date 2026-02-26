import { useState } from "react";
import { Alert } from "react-native";
import { postAPI } from "../services/api";
import { useToast } from "./Toast";

export default function useSentPostActions(onDeletePost, onRefresh) {
  const [deletingId, setDeletingId] = useState(null);
  const [retryingMap, setRetryingMap] = useState({});
  const { showToast } = useToast();

  const handleDelete = (post) => {
    Alert.alert(
      "Delete Post",
      "This post has already been published. Are you sure you want to remove it from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(post._id || post.id);
            try {
              await onDeletePost(post._id || post.id);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const handleRetry = async (post, platformName) => {
    const postId = post._id || post.id;
    const retryKey = `${postId}-${platformName}`;
    setRetryingMap((prev) => ({ ...prev, [retryKey]: true }));

    try {
      const platformIdentifiers = (post.platforms || []).filter(
        (p) => p.split(":")[0] === platformName,
      );
      if (platformIdentifiers.length === 0) {
        platformIdentifiers.push(platformName);
      }

      const { data } = await postAPI.retry(postId, platformIdentifiers);
      const retryResult = (data.publishResults || []).find(
        (r) => r.platform === platformName,
      );

      if (retryResult?.success) {
        showToast({
          type: "success",
          title: `${platformName} published`,
          message: "Post successfully sent to " + platformName,
        });
      } else {
        showToast({
          type: "error",
          title: `${platformName} failed again`,
          message: retryResult?.error || "Could not publish. Try again later.",
          duration: 5000,
        });
      }

      onRefresh?.();
    } catch (err) {
      showToast({
        type: "error",
        title: "Retry failed",
        message: err.message || "Could not retry. Check your connection.",
        duration: 5000,
      });
    } finally {
      setRetryingMap((prev) => ({ ...prev, [retryKey]: false }));
    }
  };

  const handleRetryAll = async (post) => {
    const postId = post._id || post.id;
    const failedPlatforms = (post.publishResults || [])
      .filter((r) => !r.success)
      .map((r) => r.platform);

    if (failedPlatforms.length === 0) return;

    const platformIdentifiers = [];
    for (const name of failedPlatforms) {
      const matching = (post.platforms || []).filter(
        (p) => p.split(":")[0] === name,
      );
      if (matching.length > 0) {
        platformIdentifiers.push(...matching);
      } else {
        platformIdentifiers.push(name);
      }
    }

    setRetryingMap((prev) => ({ ...prev, [`${postId}-all`]: true }));

    try {
      const { data } = await postAPI.retry(postId, platformIdentifiers);
      const results = data.publishResults || [];
      const succeeded = results.filter(
        (r) => r.success && failedPlatforms.includes(r.platform),
      );
      const stillFailed = results.filter(
        (r) => !r.success && failedPlatforms.includes(r.platform),
      );

      if (stillFailed.length === 0) {
        showToast({
          type: "success",
          title: "All platforms published",
          message: `Successfully sent to ${succeeded.map((r) => r.platform).join(", ")}`,
        });
      } else if (succeeded.length > 0) {
        showToast({
          type: "warning",
          title: "Partially published",
          message: `${succeeded.map((r) => r.platform).join(", ")} succeeded. ${stillFailed.map((r) => r.platform).join(", ")} still failed.`,
          duration: 5000,
        });
      } else {
        showToast({
          type: "error",
          title: "Retry failed",
          message: "Could not publish to any platform. Try again later.",
          duration: 5000,
        });
      }

      onRefresh?.();
    } catch (err) {
      showToast({
        type: "error",
        title: "Retry failed",
        message: err.message || "Could not retry. Check your connection.",
        duration: 5000,
      });
    } finally {
      setRetryingMap((prev) => ({ ...prev, [`${postId}-all`]: false }));
    }
  };

  return { deletingId, retryingMap, handleDelete, handleRetry, handleRetryAll };
}
