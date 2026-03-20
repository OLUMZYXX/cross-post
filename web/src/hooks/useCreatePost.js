"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { postAPI } from "@/services/postService";
import { uploadToCloudinary } from "@/services/uploadService";
import { ensureServerAwake } from "@/services/api";

export default function useCreatePost({ connectedPlatforms, onSuccess }) {
  const { showToast } = useToast();
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([...connectedPlatforms]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [rephrasedText, setRephrasedText] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);

  const hasTwitterSelected = selectedPlatforms.some((p) => p.split(":")[0] === "Twitter");

  const togglePlatform = (name) => {
    setSelectedPlatforms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  };

  const handleMediaSelect = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const results = await Promise.all(
        Array.from(files).map((f) => uploadToCloudinary(f)),
      );
      const urls = results.map((r) => r.url);
      setMediaUrls((prev) => [...prev, ...urls]);
      setMediaFiles((prev) => [...prev, ...Array.from(files)]);
    } catch (err) {
      showToast({ type: "error", title: err.message || "Upload failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (index) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRephrase = async (tone) => {
    if (!caption.trim()) {
      showToast({ type: "info", title: "Write something first" });
      return;
    }
    setSelectedTone(tone);
    setIsRephrasing(true);
    setRephrasedText(null);
    try {
      const maxLen = hasTwitterSelected && caption.length > 280 ? 280 : null;
      const { data } = await postAPI.rephrase(caption, tone, maxLen);
      setRephrasedText(data.rephrased);
    } catch (err) {
      showToast({ type: "error", title: err.message || "Rephrase failed" });
    } finally {
      setIsRephrasing(false);
    }
  };

  const applyRephrase = () => {
    if (rephrasedText) setCaption(rephrasedText);
    setRephrasedText(null);
    setSelectedTone(null);
  };

  const publishNow = async () => {
    if (selectedPlatforms.length === 0) {
      showToast({ type: "info", title: "Select at least one platform" });
      return;
    }
    setIsPosting(true);
    try {
      await ensureServerAwake();
      const { data: createData } = await postAPI.create({
        caption, media: mediaUrls, platforms: selectedPlatforms, status: "draft",
      });
      const { data: publishData } = await postAPI.publish(createData.post._id);
      const results = publishData.publishResults || [];
      const failed = results.filter((r) => !r.success);
      if (failed.length === 0) showToast({ type: "success", title: "Post published!" });
      else if (failed.length < results.length) showToast({ type: "info", title: `Partially published. ${failed.length} failed.` });
      else showToast({ type: "error", title: failed[0]?.error || "Publish failed" });
      onSuccess?.();
    } catch (err) {
      showToast({ type: "error", title: err.message || "Publish failed" });
    } finally {
      setIsPosting(false);
    }
  };

  const schedulePost = async (date) => {
    if (selectedPlatforms.length === 0) {
      showToast({ type: "info", title: "Select at least one platform" });
      return;
    }
    setIsPosting(true);
    try {
      await ensureServerAwake();
      const { data: createData } = await postAPI.create({
        caption, media: mediaUrls, platforms: selectedPlatforms, status: "draft",
      });
      await postAPI.schedule(createData.post._id, date.toISOString());
      showToast({ type: "success", title: "Post scheduled!" });
      onSuccess?.();
    } catch (err) {
      showToast({ type: "error", title: err.message || "Scheduling failed" });
    } finally {
      setIsPosting(false);
    }
  };

  const saveDraft = async () => {
    if (!caption && mediaUrls.length === 0) {
      showToast({ type: "info", title: "Add a caption or media first" });
      return;
    }
    try {
      await postAPI.create({
        caption, media: mediaUrls, platforms: selectedPlatforms, status: "draft",
      });
      showToast({ type: "success", title: "Draft saved" });
      onSuccess?.();
    } catch {
      showToast({ type: "error", title: "Failed to save draft" });
    }
  };

  return {
    caption, setCaption, selectedPlatforms, togglePlatform,
    mediaFiles, mediaUrls, handleMediaSelect, removeMedia,
    isUploading, isPosting, hasTwitterSelected,
    isRephrasing, rephrasedText, selectedTone,
    handleRephrase, applyRephrase,
    publishNow, schedulePost, saveDraft,
  };
}
