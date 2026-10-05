import Link from "next/link";

export default function Wordmark({ href = "/dashboard", size = "md", showLogo = true }) {
  const textSize = size === "lg" ? "text-[30px]" : "text-[22px]";

  return (
    <Link href={href} className="inline-flex items-center gap-2.5" aria-label="Crosspost home">
      {showLogo ? <img src="/logo.png" alt="" className="w-8 h-8 rounded-[10px]" /> : null}
      <span className={`font-display font-bold text-cp-ink leading-none ${textSize}`}>
        Crosspost<span className="text-cp-accent">·</span>
      </span>
    </Link>
  );
}
