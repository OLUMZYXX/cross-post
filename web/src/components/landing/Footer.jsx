import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <Zap size={12} className="text-black" />
          </div>
          <span className="text-neutral-500 text-sm font-medium">Cross-Post</span>
        </div>

        <div className="flex items-center gap-8 text-sm">
          <a href="/terms.html" className="text-neutral-500 hover:text-neutral-300 transition-colors duration-200">
            Terms
          </a>
          <a href="/privacy.html" className="text-neutral-500 hover:text-neutral-300 transition-colors duration-200">
            Privacy
          </a>
        </div>

        <p className="text-neutral-600 text-xs">
          &copy; {new Date().getFullYear()} Cross-Post
        </p>
      </div>
    </footer>
  );
}
