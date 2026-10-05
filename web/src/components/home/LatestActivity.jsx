import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import PostRow from "@/components/home/PostRow";
import EmptyState from "@/components/app/EmptyState";

export default function LatestActivity({ posts }) {
  return (
    <section aria-label="Latest" className="mt-7">
      <div className="flex items-center justify-between mb-3">
        <p className="cp-eyebrow !text-cp-accent">Latest</p>
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-cp-muted hover:text-cp-ink text-xs font-semibold transition-colors"
        >
          View all <ArrowRight size={13} />
        </Link>
      </div>
      <div className="rounded-3xl bg-cp-card border border-cp-rule px-5">
        {posts.length === 0 ? (
          <EmptyState
            icon={Send}
            title="Nothing sent yet"
            body="Your first post will show up here with its result on every platform."
          />
        ) : (
          <div className="divide-y divide-cp-rule">
            {posts.map((post) => (
              <PostRow key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
