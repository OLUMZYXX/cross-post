import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Send,
  Music2,
  Globe,
} from "lucide-react";
import { PLATFORM_CONFIG } from "@/config/platforms";

const ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  reddit: MessageCircle,
  telegram: Send,
  tiktok: Music2,
};

export function platformKey(name = "") {
  return name.split(":")[0].toLowerCase();
}

export function platformIcon(name) {
  return ICONS[platformKey(name)] || Globe;
}

export function platformLabel(name) {
  const key = platformKey(name);
  return PLATFORM_CONFIG[key]?.label || name.split(":")[0] || name;
}

export function platformColor(name) {
  return PLATFORM_CONFIG[platformKey(name)]?.color || "#71717a";
}
