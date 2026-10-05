import { platformAPI } from "@/services/platformService";

export const CONNECTABLE_PLATFORMS = [
  { name: "Twitter", label: "Twitter / X", start: () => platformAPI.initiateTwitterAuth() },
  { name: "Instagram", label: "Instagram", start: () => platformAPI.initiateInstagramAuth() },
  { name: "Facebook", label: "Facebook", start: () => platformAPI.initiateFacebookAuth(), allowMultiple: true },
  { name: "LinkedIn", label: "LinkedIn", start: () => platformAPI.initiateLinkedInAuth() },
  { name: "TikTok", label: "TikTok", start: () => platformAPI.initiateTikTokAuth() },
  { name: "YouTube", label: "YouTube", start: () => platformAPI.initiateYouTubeAuth() },
  { name: "Reddit", label: "Reddit", start: () => platformAPI.initiateRedditAuth() },
  { name: "Telegram", label: "Telegram", manual: true },
];
