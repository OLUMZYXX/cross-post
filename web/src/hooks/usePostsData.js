"use client";

import { useState, useEffect, useCallback } from "react";
import { postAPI } from "@/services/postService";
import { platformAPI } from "@/services/platformService";
import { expandPlatforms } from "@/utils/platforms";

export default function usePostsData() {
  const [allPosts, setAllPosts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, platformsRes] = await Promise.all([
        postAPI.list(),
        platformAPI.list(),
      ]);
      setAllPosts(postsRes.data?.posts || []);

      setPlatforms(expandPlatforms(platformsRes.data?.platforms || []));
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sentPosts = allPosts.filter((p) => p.status === "published");
  const draftPosts = allPosts.filter((p) => p.status === "draft");
  const scheduledPosts = allPosts.filter((p) => p.status === "scheduled");
  const connectedNames = platforms.map((p) => p.name);

  const refresh = () => { fetchData(); };

  const deletePost = async (id) => {
    await postAPI.delete(id);
    setAllPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return {
    allPosts, sentPosts, draftPosts, scheduledPosts,
    platforms, connectedNames, loading, refresh, deletePost,
  };
}
