import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800/50 py-8 px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
            <Zap size={12} className="text-black" />
          </div>
          <span className="text-neutral-500 text-sm">Cross-Post</span>
        </div>

        <div className="flex items-center gap-6 text-[13px]">
          <a href="/terms.html" className="text-neutral-500 hover:text-neutral-300 transition-colors">
            Terms
          </a>
          <a href="/privacy.html" className="text-neutral-500 hover:text-neutral-300 transition-colors">
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
