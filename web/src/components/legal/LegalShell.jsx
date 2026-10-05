import PageShell from "@/components/marketing/PageShell";

export default function LegalShell({ title, updated, children }) {
  return (
    <PageShell eyebrow={`Last updated ${updated}`} title={title} width="max-w-3xl">
      <div className="site-prose space-y-5 text-ink-soft text-[15px] leading-relaxed">
        {children}
      </div>
    </PageShell>
  );
}
