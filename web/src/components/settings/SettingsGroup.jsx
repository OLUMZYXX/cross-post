import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SettingsRow({ item, trailing }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-cp-deep transition-colors"
    >
      <span className="w-10 h-10 rounded-2xl bg-cp-deep border border-cp-rule flex items-center justify-center shrink-0">
        <item.icon size={17} className="text-cp-ink" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-cp-ink text-[15px] font-semibold">{item.label}</span>
        <span className="block text-cp-muted text-[13px]">{item.desc}</span>
      </span>
      {trailing}
      <ChevronRight size={17} className="text-cp-soft shrink-0" />
    </Link>
  );
}

export default function SettingsGroup({ label, children }) {
  return (
    <section className="mt-7">
      <p className="cp-eyebrow mb-2.5 ml-1">{label}</p>
      <div className="rounded-3xl bg-cp-card border border-cp-rule overflow-hidden divide-y divide-cp-rule">
        {children}
      </div>
    </section>
  );
}
