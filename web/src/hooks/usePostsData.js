"use client";

import { useState, useEffect, useCallback } from "react";
import { postAPI } from "@/services/postService";
import { platformAPI } from "@/services/platformService";

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

      const raw = platformsRes.data?.platforms || [];
      const expanded = [];
      for (const p of raw) {
        if (p.name === "Facebook" && p.pages?.length > 0 && p.selectedPageIds?.length > 0) {
          const selected = p.pages.filter((pg) => p.selectedPageIds.includes(pg.pageId));
          for (const page of selected) {
            expanded.push({
              ...p,
              _id: `${p._id}_page_${page.pageId}`,
              _parentId: p._id,
              platformUsername: page.pageName,
              _pageId: page.pageId,
            });
          }
        } else {
          expanded.push(p);
        }
      }
      setPlatforms(expanded);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sentPosts = allPosts.filter((p) => p.status === "published");
  const draftPosts = allPosts.filter((p) => p.status === "draft");
  const scheduledPosts = allPosts.filter((p) => p.status === "scheduled");
  const connectedNames = platforms.map((p) => p.name);

  const refresh = () => { setLoading(true); fetchData(); };

  const deletePost = async (id) => {
    await postAPI.delete(id);
    setAllPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return {
    allPosts, sentPosts, draftPosts, scheduledPosts,
    platforms, connectedNames, loading, refresh, deletePost,
  };
}
