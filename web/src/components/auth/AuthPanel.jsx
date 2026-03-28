import { Share2 } from "lucide-react";

export default function AuthPanel({ title, subtitle }) {
  return (
    <div className="hidden md:flex w-1/2 relative items-center justify-center overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.1)_0%,_transparent_70%)]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-500/8 rounded-full blur-[100px] animate-glow-pulse" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] animate-glow-pulse delay-500" />

      <div className="relative z-10 text-center px-12">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20 animate-float">
          <Share2 size={32} className="text-black" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
          {title}
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
          {subtitle}
        </p>

        <div className="flex items-center justify-center gap-3 mt-10">
          {["Facebook", "Instagram", "Twitter", "TikTok", "LinkedIn"].map(
            (p) => (
              <div
                key={p}
                className="w-2 h-2 rounded-full bg-green-500/30 animate-pulse-dot"
              />
            )
          )}
        </div>
        <p className="text-neutral-600 text-[10px] mt-3 tracking-wide uppercase">
          8+ platforms supported
        </p>
      </div>
    </div>
  );
}
