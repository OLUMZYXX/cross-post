"use client";

import { useState } from "react";
import { Send, FileText, Clock } from "lucide-react";
import usePostsData from "@/hooks/usePostsData";
import usePostActions from "@/hooks/usePostActions";
import PageHeader from "@/components/app/PageHeader";
import SegmentedTabs from "@/components/app/SegmentedTabs";
import EmptyState from "@/components/app/EmptyState";
import PostCard from "@/components/posts/PostCard";
import Spinner from "@/components/ui/Spinner";

const EMPTY = {
  published: { icon: Send, title: "Nothing sent yet", body: "Posts you publish show up here with their result on every platform." },
  scheduled: { icon: Clock, title: "Nothing scheduled", body: "Schedule a post and it will wait here until it goes out." },
  drafts: { icon: FileText, title: "No drafts", body: "Save a post as a draft to come back to it later." },
};

export default function PostsPage() {
  const [tab, setTab] = useState("published");
  const { sentPosts, draftPosts, scheduledPosts, loading, refresh, deletePost } = usePostsData();
  const actions = usePostActions({ deletePost, refresh });

  if (loading) return <Spinner className="py-24" />;

  const lists = { published: sentPosts, scheduled: scheduledPosts, drafts: draftPosts };
  const tabs = [
    { key: "published", label: "Sent", count: sentPosts.length },
    { key: "scheduled", label: "Scheduled", count: scheduledPosts.length },
    { key: "drafts", label: "Drafts", count: draftPosts.length },
  ];
  const posts = lists[tab];
  const empty = EMPTY[tab];

  return (
    <div className="animate-fade-in max-w-3xl">
      <PageHeader eyebrow="Your posts" title="Sent" subtitle="Everything you've published, scheduled or saved." />

      <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} label="Post status" />

      <div className="mt-6 space-y-3">
        {posts.length === 0 ? (
          <div className="rounded-3xl bg-cp-card border border-cp-rule">
            <EmptyState
              icon={empty.icon}
              title={empty.title}
              body={empty.body}
              actionLabel="Write a post"
              actionHref="/create"
            />
          </div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} actions={actions} />)
        )}
      </div>
    </div>
  );
}
