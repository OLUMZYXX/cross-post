export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7 sm:mb-9">
      <div className="min-w-0">
        {eyebrow ? <p className="cp-eyebrow !text-cp-accent mb-2">{eyebrow}</p> : null}
        <h1 className="font-display text-cp-ink text-[30px] sm:text-[38px] leading-[1.05] font-semibold tracking-[-0.01em]">
          {title}
        </h1>
        {subtitle ? <p className="text-cp-muted text-[15px] mt-2">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
