import { Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <span className="md:hidden"><Share2 size={10} className="text-black" /></span>
            <span className="hidden md:inline-flex"><Share2 size={12} className="text-black" /></span>
          </div>
          <span className="text-neutral-500 text-xs md:text-sm font-medium">
            Cross-Post
          </span>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <a
            href="/support"
            className="text-neutral-500 hover:text-neutral-300 text-xs md:text-sm transition-colors duration-200"
          >
            Support
          </a>
          <a
            href="/terms"
            className="text-neutral-500 hover:text-neutral-300 text-xs md:text-sm transition-colors duration-200"
          >
            Terms
          </a>
          <a
            href="/privacy"
            className="text-neutral-500 hover:text-neutral-300 text-xs md:text-sm transition-colors duration-200"
          >
            Privacy
          </a>
        </div>

        <p className="text-neutral-600 text-[10px] md:text-xs">
          &copy; {new Date().getFullYear()} Cross-Post
        </p>
      </div>
    </footer>
  );
}
