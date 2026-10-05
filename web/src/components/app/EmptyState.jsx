import Link from "next/link";

export default function EmptyState({ icon: Icon, title, body, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      {Icon ? (
        <span className="w-14 h-14 rounded-3xl bg-cp-deep border border-cp-rule flex items-center justify-center mb-5">
          <Icon size={22} className="text-cp-muted" />
        </span>
      ) : null}
      <p className="font-display text-cp-ink text-xl font-semibold">{title}</p>
      {body ? <p className="text-cp-muted text-sm mt-2 max-w-xs leading-relaxed">{body}</p> : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="cp-chunky mt-6 inline-flex items-center bg-cp-accent text-white text-sm font-semibold px-5 py-2.5 rounded-2xl"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
