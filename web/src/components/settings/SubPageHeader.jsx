import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function SubPageHeader({ title, subtitle, backHref = "/settings", backLabel = "Profile" }) {
  return (
    <div className="mb-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 -ml-1.5 text-cp-muted hover:text-cp-ink text-sm font-semibold transition-colors"
      >
        <ChevronLeft size={18} />
        {backLabel}
      </Link>
      <h1 className="font-display text-cp-ink text-[30px] sm:text-[36px] leading-tight font-semibold mt-3">{title}</h1>
      {subtitle ? <p className="text-cp-muted text-[15px] mt-1.5">{subtitle}</p> : null}
    </div>
  );
}
