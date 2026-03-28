import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Send,
  Music2,
} from "lucide-react";

const PLATFORMS = [
  { name: "Facebook", icon: Facebook, color: "#1877F2" },
  { name: "Instagram", icon: Instagram, color: "#E4405F" },
  { name: "Twitter / X", icon: Twitter, color: "#1DA1F2" },
  { name: "TikTok", icon: Music2, color: "#ff0050" },
  { name: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { name: "YouTube", icon: Youtube, color: "#FF0000" },
  { name: "Reddit", icon: MessageCircle, color: "#FF4500" },
  { name: "Telegram", icon: Send, color: "#0088cc" },
];

export default function Platforms() {
  return (
    <section id="platforms" className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-4 tracking-tight">
          All your platforms
        </h2>
        <p className="text-neutral-400 text-xs md:text-base max-w-md mx-auto mb-8 md:mb-14">
          Connect once and publish to every platform simultaneously
        </p>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 md:gap-3 max-w-2xl mx-auto">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="group flex items-center gap-2 md:gap-3 glass rounded-lg md:rounded-xl px-3 py-2 md:px-5 md:py-3 hover:bg-white/[0.04] transition-all duration-300 cursor-default"
            >
              <div
                className="w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${p.color}15` }}
              >
                <span className="md:hidden"><p.icon size={13} style={{ color: p.color }} /></span>
                <span className="hidden md:inline-flex"><p.icon size={16} style={{ color: p.color }} /></span>
              </div>
              <span className="text-neutral-300 group-hover:text-white text-xs md:text-sm font-medium transition-colors duration-200">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
