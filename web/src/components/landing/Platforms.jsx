import { Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Send, Music2 } from "lucide-react";

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
    <section id="platforms" className="py-20 px-6">
      <div className="max-w-[1400px] mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          All your platforms
        </h2>
        <p className="text-neutral-400 text-sm max-w-md mx-auto mb-12">
          Connect once and publish to every platform simultaneously
        </p>

        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2.5 bg-neutral-900/50 border border-neutral-800/50 rounded-lg px-4 py-2.5 hover:border-neutral-700/60 transition-colors"
            >
              <p.icon size={18} style={{ color: p.color }} />
              <span className="text-neutral-300 text-sm">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
