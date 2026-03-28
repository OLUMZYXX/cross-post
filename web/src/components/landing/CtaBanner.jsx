import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="py-14 md:py-24 px-4 md:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.06)_0%,_transparent_60%)]" />

      <div className="max-w-3xl mx-auto relative">
        <div className="glass rounded-2xl md:rounded-3xl p-8 sm:p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-green-500/8 rounded-full blur-[80px]" />

          <div className="relative">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 sm:mb-3 md:mb-4 tracking-tight">
              Ready to simplify your
              <br />
              <span className="text-gradient-green">social media?</span>
            </h2>
            <p className="text-neutral-400 text-[11px] sm:text-sm md:text-base max-w-md mx-auto mb-6 sm:mb-8">
              Join thousands of creators who save hours every week with
              Cross-Post. Start for free, no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-2.5 md:px-7 md:py-3 rounded-xl hover:bg-neutral-100 transition-all duration-200 text-[13px] md:text-sm shadow-lg shadow-white/10"
              >
                Start for free
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <a
                href="#pricing"
                className="w-full sm:w-auto text-center text-neutral-300 hover:text-white text-[13px] md:text-sm px-6 py-2.5 md:px-7 md:py-3 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200"
              >
                See pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
