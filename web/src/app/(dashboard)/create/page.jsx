"use client";

import { useRouter } from "next/navigation";
import usePostsData from "@/hooks/usePostsData";
import PageHeader from "@/components/app/PageHeader";
import Composer from "@/components/compose/Composer";
import Spinner from "@/components/ui/Spinner";

export default function CreatePostPage() {
  const router = useRouter();
  const { platforms, connectedNames, loading } = usePostsData();

  if (loading) return <Spinner className="py-24" />;

  return (
    <div className="animate-fade-in max-w-2xl">
      <PageHeader
        eyebrow="New post"
        title="Compose once"
        subtitle="Write it, pick where it goes, and publish or schedule."
      />
      <Composer platforms={platforms} connectedNames={connectedNames} onDone={() => router.push("/posts")} />
    </div>
  );
}
