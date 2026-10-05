import { Image, FileText } from "lucide-react";
import ChartCard from "@/components/analytics/ChartCard";

export default function MediaSplit({ media }) {
  const total = media.withMedia + media.textOnly;
  const mediaShare = total > 0 ? Math.round((media.withMedia / total) * 100) : 0;

  return (
    <ChartCard eyebrow="Content" title="Media vs text">
      {total === 0 ? (
        <p className="text-cp-muted text-sm py-6">No posts sent yet.</p>
      ) : (
        <>
          <div className="h-3 rounded-full bg-cp-deep overflow-hidden flex">
            <div className="h-full bg-cp-info" style={{ width: `${mediaShare}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-2xl bg-cp-info-soft/60 p-4">
              <Image size={17} className="text-cp-info" />
              <p className="font-display text-cp-ink text-2xl font-semibold mt-2 tabular-nums">{media.withMedia}</p>
              <p className="text-cp-muted text-xs mt-0.5">With photos or video</p>
            </div>
            <div className="rounded-2xl bg-cp-deep p-4">
              <FileText size={17} className="text-cp-muted" />
              <p className="font-display text-cp-ink text-2xl font-semibold mt-2 tabular-nums">{media.textOnly}</p>
              <p className="text-cp-muted text-xs mt-0.5">Text only</p>
            </div>
          </div>
        </>
      )}
    </ChartCard>
  );
}
